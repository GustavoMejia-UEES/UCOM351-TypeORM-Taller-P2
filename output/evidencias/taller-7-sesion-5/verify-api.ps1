$ErrorActionPreference = 'Stop'
$api = 'http://localhost:3100/api'
$lines = [System.Collections.Generic.List[string]]::new()

$filterResponse = Invoke-WebRequest "$api/fotos?min=0&max=5&q=FOTO&etiqueta=PLAyA&orden=ASC&page=1&limit=5" -SkipHttpErrorCheck
$filter = $filterResponse.Content | ConvertFrom-Json
$ratings = @($filter.data | ForEach-Object { [double]$_.calificacion })
$ascending = $true
for ($i = 1; $i -lt $ratings.Count; $i++) {
  if ($ratings[$i] -lt $ratings[$i - 1]) { $ascending = $false }
}
$allTagged = @($filter.data | Where-Object { $_.etiquetas.texto -notcontains 'playa' }).Count -eq 0
$allHaveAlbum = @($filter.data | Where-Object { -not $_.album }).Count -eq 0
if ($filterResponse.StatusCode -ne 200 -or -not $ascending -or -not $allTagged -or -not $allHaveAlbum) {
  throw 'Falló la consulta de relaciones, filtro u orden ascendente.'
}
$filter | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'filtro-etiqueta.json')
$lines.Add("GET filtro etiqueta/relaciones: HTTP $($filterResponse.StatusCode), total=$($filter.total), resultados=$($filter.data.Count), orden ASC=$ascending, etiqueta texto=$allTagged, álbum=$allHaveAlbum")

$descResponse = Invoke-WebRequest "$api/fotos?etiqueta=playa&orden=DESC&limit=10" -SkipHttpErrorCheck
$desc = $descResponse.Content | ConvertFrom-Json
$descRatings = @($desc.data | ForEach-Object { [double]$_.calificacion })
$descRatingText = @($descRatings | ForEach-Object { $_.ToString('0.0', [Globalization.CultureInfo]::InvariantCulture) }) -join ', '
$descending = $true
for ($i = 1; $i -lt $descRatings.Count; $i++) {
  if ($descRatings[$i] -gt $descRatings[$i - 1]) { $descending = $false }
}
if ($descResponse.StatusCode -ne 200 -or -not $descending) { throw 'Falló el orden descendente.' }
$lines.Add("GET etiqueta=playa&orden=DESC: HTTP $($descResponse.StatusCode), calificaciones=$descRatingText, orden DESC=$descending")

$tooMany = Invoke-WebRequest "$api/fotos?limit=999" -SkipHttpErrorCheck
if ($tooMany.StatusCode -ne 400) { throw 'limit=999 debía responder HTTP 400.' }
$lines.Add("GET limit=999: HTTP $($tooMany.StatusCode), $($tooMany.Content)")

$album = Invoke-WebRequest "$api/albumes/1/fotos" -SkipHttpErrorCheck
$albumData = $album.Content | ConvertFrom-Json
if ($album.StatusCode -ne 200 -or $albumData.fotos.Count -eq 0) { throw 'Falló GET /albumes/1/fotos.' }
$lines.Add("GET /albumes/1/fotos: HTTP $($album.StatusCode), álbum=$($albumData.nombre), fotos=$($albumData.fotos.Count)")

$createdId = $null
try {
  $validBody = @{
    titulo = 'Cerro Santa Ana'
    descripcion = 'Vista de Guayaquil'
    calificacion = 4.8
    ruta = 'https://picsum.photos/id/1/600/400'
    albumId = 2
    etiquetas = @('Ciudad', 'faro')
  } | ConvertTo-Json
  $createdResponse = Invoke-WebRequest "$api/fotos" -Method Post -ContentType 'application/json' -Body $validBody -SkipHttpErrorCheck
  $created = $createdResponse.Content | ConvertFrom-Json
  if ($createdResponse.StatusCode -ne 201 -or $created.album.nombre -ne 'Guayaquil' -or $created.etiquetas.texto -notcontains 'faro') {
    throw 'El POST válido no devolvió foto, álbum y etiquetas.'
  }
  $createdId = $created.id
  $created | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'foto-creada.json')
  $lines.Add("POST foto con albumId y etiquetas: HTTP $($createdResponse.StatusCode), id=$createdId, álbum=$($created.album.nombre), etiquetas=$($created.etiquetas.texto -join ', ')")

  $invalidBody = @{ titulo = ''; calificacion = 9; ruta = 'no-url'; hack = 1 } | ConvertTo-Json
  $invalid = Invoke-WebRequest "$api/fotos" -Method Post -ContentType 'application/json' -Body $invalidBody -SkipHttpErrorCheck
  if ($invalid.StatusCode -ne 400) { throw 'El POST inválido debía responder HTTP 400.' }
  $lines.Add("POST campos inválidos y propiedad extra: HTTP $($invalid.StatusCode), $($invalid.Content)")

  $invalidAlbum = @{
    titulo = 'Album inexistente'
    calificacion = 3
    ruta = 'https://picsum.photos/id/2/600/400'
    albumId = 999999
  } | ConvertTo-Json
  $foreignKey = Invoke-WebRequest "$api/fotos" -Method Post -ContentType 'application/json' -Body $invalidAlbum -SkipHttpErrorCheck
  if ($foreignKey.StatusCode -ne 400 -or $foreignKey.Content -notmatch 'Referencia a un registro inexistente') {
    throw 'El filtro TypeORM no tradujo la FK inexistente a HTTP 400.'
  }
  $lines.Add("POST albumId inexistente: HTTP $($foreignKey.StatusCode), $($foreignKey.Content)")

  $patchBody = @{ calificacion = 2.5 } | ConvertTo-Json
  $updatedResponse = Invoke-WebRequest "$api/fotos/$createdId" -Method Patch -ContentType 'application/json' -Body $patchBody -SkipHttpErrorCheck
  $updated = $updatedResponse.Content | ConvertFrom-Json
  if ($updatedResponse.StatusCode -ne 200 -or $updated.calificacion -ne 2.5 -or $updated.titulo -ne 'Cerro Santa Ana') {
    throw 'El PATCH parcial no preservó los demás campos.'
  }
  $updated | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'foto-actualizada.json')
  $lines.Add("PATCH solo calificacion: HTTP $($updatedResponse.StatusCode), titulo preservado=$($updated.titulo), calificacion=$($updated.calificacion)")

  $deleted = Invoke-WebRequest "$api/fotos/$createdId" -Method Delete -SkipHttpErrorCheck
  if ($deleted.StatusCode -ne 204 -or $deleted.Content.Length -ne 0) { throw 'DELETE debía responder 204 sin cuerpo.' }
  $createdId = $null
  $lines.Add("DELETE foto: HTTP $($deleted.StatusCode), cuerpo vacío=$($deleted.Content.Length -eq 0)")
}
finally {
  if ($null -ne $createdId) {
    Invoke-WebRequest "$api/fotos/$createdId" -Method Delete -SkipHttpErrorCheck | Out-Null
  }
}

$lines | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'api-terminal.txt')
$lines | ForEach-Object { Write-Output $_ }
