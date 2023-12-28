import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()

  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No files received.' }, { status: 400 })
  }

  console.log(file)

  return NextResponse.json({ Message: '', status: 201 })

  // const buffer = Buffer.from(await file.arrayBuffer())
  // const filename = Date.now() + file.name.replaceAll(' ', '_')
  // console.log(filename)
  // try {
  //   await writeFile(
  //     path.join(process.cwd(), 'public/uploads/' + filename),
  //     buffer,
  //   )
  //   return NextResponse.json({ Message: 'Success', status: 201 })
  // } catch (error) {
  //   console.log('Error occured ', error)
  //   return NextResponse.json({ Message: 'Failed', status: 500 })
  // }
}
