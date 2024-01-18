import type { AttachmentOptions } from 'mimetext'

const dataURLRegExpr = /^data:([-\w]+\/[-+\w.]+);base64,(.*)$/
export const mkBase64Encoded = (file: File): Promise<AttachmentOptions> => {
  return new Promise<AttachmentOptions>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onloadend = (evt) => {
      if (evt.target?.readyState === FileReader.DONE && typeof evt.target.result === 'string') {
        const result = evt.target.result.match(dataURLRegExpr)
        if (!result) {
          reject(new Error('Failed to encode file'))
          return
        }
        const [_, contentType, data] = result
        resolve({
          filename: file.name,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          contentType: contentType!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data: data!,
        })
      }
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
    fileReader.readAsDataURL(file)
  })
}
