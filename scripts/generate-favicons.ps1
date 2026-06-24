param(
    [Parameter(Mandatory=$true)]
    [string]$SourceImage
)

if (-not (Test-Path $SourceImage)) {
    Write-Error "Source image not found: $SourceImage"
    exit 1
}

$publicDir = Join-Path $PSScriptRoot ".." "public"
$assetsDir = Join-Path $publicDir "assets" "images"

# Ensure directories exist
New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null

# Check if ImageMagick is available
$magick = Get-Command "magick" -ErrorAction SilentlyContinue

if ($magick) {
    Write-Host "Using ImageMagick to generate favicon assets..."

    # Favicon 32x32
    & magick "$SourceImage" -resize 32x32 "$assetsDir\favicon-32x32.png"

    # Favicon 16x16
    & magick "$SourceImage" -resize 16x16 "$assetsDir\favicon-16x16.png"

    # Apple touch icon
    & magick "$SourceImage" -resize 180x180 "$publicDir\apple-touch-icon.png"

    # Android Chrome 192
    & magick "$SourceImage" -resize 192x192 "$assetsDir\android-chrome-192.png"

    # Android Chrome 512
    & magick "$SourceImage" -resize 512x512 "$assetsDir\android-chrome-512.png"

    # Logo PNG
    & magick "$SourceImage" -resize 120x40 "$assetsDir\logo.png"

    # Favicon ICO
    & magick "$SourceImage" -resize 32x32 -define icon:auto-resize=16,32 "$publicDir\favicon.ico"

    Write-Host "All favicon assets generated successfully!"
} else {
    Write-Host "ImageMagick not found. Checking for alternative tools..."

    # Try using .NET if on Windows
    try {
        Add-Type -AssemblyName System.Drawing

        function Resize-Image($source, $dest, $width, $height) {
            $img = [System.Drawing.Image]::FromFile($source)
            $bmp = New-Object System.Drawing.Bitmap($width, $height)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0, 0, $width, $height)
            $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
            $g.Dispose()
            $bmp.Dispose()
            $img.Dispose()
            Write-Host "  Generated: $dest"
        }

        Write-Host "Using .NET System.Drawing to generate favicon assets..."
        Resize-Image $SourceImage "$assetsDir\favicon-32x32.png" 32 32
        Resize-Image $SourceImage "$assetsDir\favicon-16x16.png" 16 16
        Resize-Image $SourceImage "$publicDir\apple-touch-icon.png" 180 180
        Resize-Image $SourceImage "$assetsDir\android-chrome-192.png" 192 192
        Resize-Image $SourceImage "$assetsDir\android-chrome-512.png" 512 512
        Resize-Image $SourceImage "$assetsDir\logo.png" 120 40

        Write-Host "All favicon assets generated successfully!"
    }
    catch {
        Write-Warning "No image processing tools found."
        Write-Host "To generate favicon assets manually, install ImageMagick (https://imagemagick.org) and run:"
        Write-Host "  .\scripts\generate-favicons.ps1 -SourceImage `"$SourceImage`""
        Write-Host ""
        Write-Host "Or use an online favicon generator like https://realfavicongenerator.net"
        Write-Host "Upload your logo and place generated files in:"
        Write-Host "  - public\favicon.ico"
        Write-Host "  - public\apple-touch-icon.png"
        Write-Host "  - public\assets\images\favicon-32x32.png"
        Write-Host "  - public\assets\images\favicon-16x16.png"
        Write-Host "  - public\assets\images\android-chrome-192.png"
        Write-Host "  - public\assets\images\android-chrome-512.png"
        Write-Host "  - public\assets\images\logo.png"
    }
}
