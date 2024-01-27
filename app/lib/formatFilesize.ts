const formatFilesize = (filesize: number) => {
  const kb = Math.round(filesize / 10.24) / 100
  if (kb < 1024) return kb + ' KB'
  const mb = Math.round(kb / 10.24) / 100
  return mb + ' MB'
}

export default formatFilesize
