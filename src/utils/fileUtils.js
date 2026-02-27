export function downloadBlob(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Revoke after the click task completes so browsers finish reading the URL safely.
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
}
