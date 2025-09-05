$uri = "http://127.0.0.1:8000/candidates/"
$filePaths = @("SIH/sampl-Resume.pdf", "SIH/income-certificate.pdf")
$fileNames = @("resume", "income_certificate")
$name = "John Doe"
$email = "john.doe@example.com"

$boundary = [System.Guid]::NewGuid().ToString()
$crlf = "`r`n"

$requestBody = ""

$requestBody += "--$boundary" + $crlf
$requestBody += "Content-Disposition: form-data; name=`"name`"" + $crlf + $crlf
$requestBody += $name + $crlf

$requestBody += "--$boundary" + $crlf
$requestBody += "Content-Disposition: form-data; name=`"email`"" + $crlf + $crlf
$requestBody += $email + $crlf

for ($i = 0; $i -lt $filePaths.Length; $i++) {
    $filePath = $filePaths[$i]
    $fileName = $fileNames[$i]
    $fileContent = [System.IO.File]::ReadAllBytes($filePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($fileContent)

    $requestBody += "--$boundary" + $crlf
    $requestBody += "Content-Disposition: form-data; name=`"$fileName`"; filename=`"$(Split-Path $filePath -Leaf)`"" + $crlf
    $requestBody += "Content-Type: application/pdf" + $crlf + $crlf
    $requestBody += $fileEnc + $crlf
}

$requestBody += "--$boundary--" + $crlf

$headers = @{
    "Content-Type" = "multipart/form-data; boundary=`"$boundary`""
}

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $requestBody
