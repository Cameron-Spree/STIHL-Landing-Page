$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "========================================="
    Write-Host "STIHL Landing Page server running on:"
    Write-Host "--> http://localhost:$port/"
    Write-Host "========================================="
    Write-Host "Keep this window open. Press Ctrl+C in terminal to stop."

    # Open Microsoft Edge preview automatically
    Start-Process "msedge" "http://localhost:$port/"

    while ($listener.IsListening) {
        $response = $null
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/") { $localPath = "/index.html" }
            
            # Security: Clean path to prevent directory traversal
            $cleanedPath = $localPath.Replace("..", "").TrimStart('/')
            $filePath = Join-Path "c:\Users\CameronSpree\Gemini Apps\STIHL Landing Page" $cleanedPath
            
            if (Test-Path $filePath -PathType Leaf) {
                # Set response headers
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css"  { $response.ContentType = "text/css" }
                    ".js"   { $response.ContentType = "application/javascript" }
                    ".png"  { $response.ContentType = "image/png" }
                    ".mp4"  { $response.ContentType = "video/mp4" }
                    default { $response.ContentType = "application/octet-stream" }
                }
                
                # Support range requests for video streaming (HTTP 206)
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $rangeHeader = $request.Headers["Range"]
                
                if ($null -ne $rangeHeader -and $rangeHeader -match 'bytes=(\d+)-(\d*)') {
                    $start = [int64]$Matches[1]
                    $end = $bytes.Length - 1
                    if ($Matches[2] -ne "") {
                        $end = [int64]$Matches[2]
                    }
                    
                    # Bound checks
                    if ($start -ge $bytes.Length) {
                        $response.StatusCode = 416 # Range Not Satisfiable
                        $response.Close()
                        continue
                    }
                    if ($end -ge $bytes.Length) {
                        $end = $bytes.Length - 1
                    }
                    
                    $length = $end - $start + 1
                    $response.StatusCode = 206 # Partial Content
                    $response.AddHeader("Content-Range", "bytes $start-$end/$($bytes.Length)")
                    $response.AddHeader("Accept-Ranges", "bytes")
                    $response.ContentLength64 = $length
                    
                    # Write partial chunk
                    $response.OutputStream.Write($bytes, [int]$start, [int]$length)
                } else {
                    # Standard response
                    $response.StatusCode = 200
                    $response.AddHeader("Accept-Ranges", "bytes")
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File not found: $localPath")
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
        } catch {
            # Log write errors (like socket closures) but don't exit the loop
            Write-Host "Request Handler Error: $_"
            if ($null -ne $response) {
                try { $response.Close() } catch {}
            }
        }
    }
} catch {
    Write-Host "Error starting server: $_"
} finally {
    if ($null -ne $listener) {
        $listener.Close()
    }
}
