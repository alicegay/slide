'use client'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import md5 from 'md5'
import Link from 'next/link'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const UploadEditPage = () => {
  const [selectedImage, setSelectedImage] = useState<File>()
  const [hash, setHash] = useState<string>()
  const [showHashError, setShowHashError] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>()

  const setImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(event.target.files[0])
      event.target.files[0].arrayBuffer().then((buffer) => {
        setHash(md5(new Uint8Array(buffer)))
      })
    }
  }

  useEffect(() => {
    if (hash) {
      axios
        .get('/api/image/' + hash)
        .then(() => {
          setShowHashError(true)
        })
        .catch(() => {
          setShowHashError(false)
        })
    }
  }, [hash])

  const upload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const options: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: any) => {
        const percentage = (progressEvent.loaded * 100) / progressEvent.total
        setUploadProgress(+percentage.toFixed(2))
      },
    }
    const formData = new FormData(event.currentTarget)
    axios
      .post('/api/upload', formData, options)
      .then(() => {
        setError(undefined)
      })
      .catch((error) => {
        setError(error.response?.data.error)
      })
  }

  return (
    <div className="flex w-full gap-x-4">
      <form
        className="grid grid-cols-1 flex-grow gap-y-2 content-start min-w-fit"
        onSubmit={upload}
      >
        {showHashError && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>An image with this hash already exists.</span>
            <Link href={'/view/' + hash} className="btn btn-sm">
              View Image
            </Link>
          </div>
        )}

        {error && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <input
          name="file"
          type="file"
          accept="image/*"
          className="file-input bg-base-200"
          onChange={setImage}
        />

        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">Hash</div>
          <input
            name="hash"
            type="text"
            className="input w-full bg-base-200 join-item"
            value={hash}
            spellCheck={false}
            autoComplete="off"
            disabled
          />
        </div>

        <textarea
          name="tags"
          className="textarea w-full bg-base-200"
          placeholder="Tags"
          spellCheck={false}
          autoComplete="off"
        ></textarea>

        <div className="flex gap-x-2 items-center">
          <label className="label cursor-pointer w-full">
            <span className="label-text">R-18</span>
            <input
              name="explicit"
              type="checkbox"
              className="toggle toggle-error"
            />
          </label>
          <div className="btn btn-sm" onClick={() => {}}>
            Copy Tags
          </div>
        </div>

        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">
            Source
          </div>
          <input
            name="source"
            type="text"
            className="input w-full bg-base-200 join-item"
            placeholder="https://"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-x-2 items-end">
          <progress
            className="progress progress-success"
            value={uploadProgress}
            max="100"
          />
          <button
            className="btn btn-success"
            type="submit"
            disabled={showHashError || !selectedImage}
          >
            Upload
          </button>
        </div>
      </form>

      <div>
        <img src={selectedImage && URL.createObjectURL(selectedImage)} />
      </div>
    </div>
  )
}

export default UploadEditPage
