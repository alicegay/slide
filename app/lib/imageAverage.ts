import sharp from 'sharp'

const imageAverage = async (image: Buffer) => {
  const greyscale = await sharp(image)
    .greyscale()
    .resize(8, 8, { fit: 'fill' })
    .raw()
    .toBuffer()
  const pixelArray = new Uint8ClampedArray(greyscale)

  let average = 0
  for (let i = 0; i < pixelArray.length; i++) {
    const pixel = pixelArray[i]
    average += pixel
  }
  average /= pixelArray.length

  let bits = ''
  for (let i = 0; i < pixelArray.length; i++) {
    const pixel = pixelArray[i]
    if (pixel > average) bits += '1'
    else bits += '0'
  }

  const dec = parseInt(bits, 2)
  const hex = dec.toString(16)

  return hex
}

export default imageAverage
