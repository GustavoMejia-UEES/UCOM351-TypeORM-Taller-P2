$ErrorActionPreference = 'Stop'
$api = 'http://localhost:3100/api'
$lines = [System.Collections.Generic.List[string]]::new()

$response = Invoke-WebRequest "$api/fotos?min=0&max=5&q=FOTO&etiqueta=PLAyA&orden=ASC&page=1&limit=5" -SkipHttpErrorCheck
$result = $response.Content | ConvertFrom-Json
$ratings = @($result.data | ForEach-Object { [double]$_.calificacion })
$ascending = $true
for ($i = 1; $i -lt $ratings.Count; $i++) {
  if ($ratings[$i] -lt $ratings[$i - 1]) { $ascending = $false }
}
$tagMatches = @($result.data | Where-Object { $_.etiquetas.texto -notcontains 'playa' }).Count -eq 0
$albumsLoaded = @($result.data | Where-Object { -not $_.album }).Count -eq 0
if ($response.StatusCode -ne 200 -or -not $ascending -or -not $tagMatches -or -not $albumsLoaded) {
  throw 'Falló el filtro por etiqueta, el orden ASC o las relaciones incluidas.'
}
$result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'filtro-relaciones.json')
$ratingText = @($ratings | ForEach-Object { $_.ToString('0.0', [Globalization.CultureInfo]::InvariantCulture) }) -join ', '
$lines.Add("GET filtros y relaciones: HTTP $($response.StatusCode), total=$($result.total), página=$($result.data.Count), calificación ASC=$ratingText")
$lines.Add("etiqueta texto coincide sin mayúsculas=$tagMatches; álbum incluido=$albumsLoaded")
$lines.Add("ejemplo: $($result.data[0].titulo), calificación=$($result.data[0].calificacion), álbum=$($result.data[0].album.nombre), etiquetas=$($result.data[0].etiquetas.texto -join ', ')")

$albumResponse = Invoke-WebRequest "$api/albumes/1/fotos" -SkipHttpErrorCheck
$album = $albumResponse.Content | ConvertFrom-Json
if ($albumResponse.StatusCode -ne 200 -or $album.fotos.Count -eq 0) { throw 'Falló la ruta anidada del álbum.' }
$album | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'album-con-fotos.json')
$lines.Add("GET /albumes/1/fotos: HTTP $($albumResponse.StatusCode), álbum=$($album.nombre), fotos=$($album.fotos.Count)")

$badNumber = Invoke-WebRequest "$api/fotos?min=abc" -SkipHttpErrorCheck
if ($badNumber.StatusCode -ne 400) { throw 'min=abc debía responder HTTP 400.' }
$lines.Add("GET min=abc: HTTP $($badNumber.StatusCode), $($badNumber.Content)")

$lines | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'api-terminal.txt')
$lines | ForEach-Object { Write-Output $_ }
