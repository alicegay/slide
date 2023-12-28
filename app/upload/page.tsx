'use client'
import { ChangeEvent, useState } from 'react'
import md5 from 'md5'

const UploadEditPage = () => {
  const [selectedImage, setSelectedImage] = useState<File>()
  const [hash, setHash] = useState<string>()

  const setImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0])
      e.target.files[0].arrayBuffer().then((buffer) => {
        setHash(md5(new Uint8Array(buffer)))
      })
    }
  }

  return (
    <div className="flex w-full gap-x-4">
      <div className="grid grid-cols-1 flex-grow gap-y-2 content-start min-w-fit">
        <input
          type="file"
          accept="image/*"
          className="file-input bg-base-200 w-full"
          onChange={setImage}
        />
        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">Hash</div>
          <input
            type="text"
            className="input w-full bg-base-200 join-item"
            value={hash}
            disabled
          />
        </div>
        <textarea
          className="textarea w-full bg-base-200"
          placeholder="Tags"
        ></textarea>
        <label className="label cursor-pointer">
          <span className="label-text">R-18</span>
          <input type="checkbox" className="toggle toggle-error" />
        </label>
        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">
            Source
          </div>
          <input
            type="text"
            className="input w-full bg-base-200 join-item"
            placeholder="https://"
          />
        </div>
      </div>
      <div>
        <img src={selectedImage && URL.createObjectURL(selectedImage)} />
      </div>
    </div>
  )
}

export default UploadEditPage
