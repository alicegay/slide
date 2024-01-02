'use client'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import md5 from 'md5'
import Link from 'next/link'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { RedirectType, notFound, useRouter } from 'next/navigation'
import { Prisma } from '@prisma/client'

interface Props {
  searchParams: {
    hash: string
  }
}

const imageWithTags = Prisma.validator<Prisma.ImageDefaultArgs>()({
  include: { tags: true },
})
type ImageWithTags = Prisma.ImageGetPayload<typeof imageWithTags>

const UploadEditPage = ({ searchParams }: Props) => {
  const editHash = searchParams.hash
  useEffect(() => {
    if (editHash) {
      axios
        .get<ImageWithTags>('/api/image/' + editHash)
        .then((res) => {
          setHash(editHash)
          setEditImage(res.data)
          if (res.data.tags.some((e) => e.name === 'explicit'))
            setExplicit(true)
        })
        .catch(() => {
          notFound()
        })
    }
  }, [])

  const router = useRouter()

  const [selectedImage, setSelectedImage] = useState<File>()
  const [hash, setHash] = useState<string>()
  const [showHashError, setShowHashError] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [explicit, setExplicit] = useState(false)
  const [editImage, setEditImage] = useState<ImageWithTags>()
  const [error, setError] = useState<string>()

  const tagsRef = useRef(null)

  const setImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(event.target.files[0])
      event.target.files[0].arrayBuffer().then((buffer) => {
        setHash(md5(new Uint8Array(buffer)))
      })
    }
  }

  useEffect(() => {
    if (hash && !editHash) {
      axios
        .get('/api/image/' + hash)
        .then(() => {
          console.warn('Image Hash already exists')
          setShowHashError(true)
        })
        .catch(() => {
          console.log('Image Hash does not already exist')
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
      .then((res) => {
        console.log('UPLOAD SUCCESS')
        setError(undefined)
        router.push('/view/' + res.data.hash)
      })
      .catch((error) => {
        console.warn(error)
        if (error.response.data && error.response.data.error)
          setError('Upload Error:   ' + error.response.data.error)
        else setError('Error: ' + error.response.status)
      })
  }

  const edit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    //axios.patch('/api/edit/' + editHash)
  }

  const deleteImage = () => {
    axios
      .delete('/api/delete/' + editHash)
      .then(() => {
        router.push('/search')
      })
      .catch((error) => {
        console.warn(error)
      })
  }

  return (
    <div className="flex w-full gap-x-4">
      <form
        className="grid grid-cols-1 flex-grow gap-y-2 content-start uploadbar"
        onSubmit={editHash ? edit : upload}
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
            <Link href={'/edit/' + hash} className="btn btn-sm btn-warning">
              Edit Image
            </Link>
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

        {!editHash && (
          <input
            name="file"
            type="file"
            accept="image/*"
            className="file-input bg-base-200"
            onChange={setImage}
          />
        )}

        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">Hash</div>
          <div className="input w-full bg-base-200 join-item pt-3">{hash}</div>
        </div>

        <textarea
          ref={tagsRef}
          name="tags"
          className="textarea w-full bg-base-200"
          placeholder="Tags"
          spellCheck={false}
          autoComplete="off"
          defaultValue={
            editHash &&
            editImage?.tags
              .map((tag) => tag.name)
              .filter((tag) => tag !== 'safe' && tag !== 'explicit')
              .join(' ')
          }
        />

        <div className="flex gap-x-2 items-center">
          <label className="label cursor-pointer w-full">
            <span className="label-text">Explicit</span>
            <input
              name="explicit"
              type="checkbox"
              className="toggle toggle-error"
              checked={explicit}
              onClick={() => {
                setExplicit(!explicit)
              }}
            />
          </label>
          <div
            className="btn btn-sm"
            onClick={async () => {
              try {
                // @ts-ignore
                await navigator.clipboard.writeText(tagsRef.current.value)
                console.log('COPIED')
              } catch (error) {
                // @ts-ignore
                await tagsRef.current!.select()
                document.execCommand('copy')
                console.log('COPIED (BACKUP)')
              }
            }}
          >
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
            defaultValue={(editHash && editImage?.source) ?? undefined}
          />
        </div>

        {/* <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 join-item">
            Parent
          </div>
          <input
            name="parent"
            type="text"
            className="input w-full bg-base-200 join-item"
            placeholder="https://"
            spellCheck={false}
            autoComplete="off"
            defaultValue={(editHash && editImage?.) ?? undefined}
          />
        </div> */}

        <div className="flex gap-x-2 items-end justify-between">
          {!editHash ? (
            <>
              <progress
                className="progress progress-success"
                value={uploadProgress}
                max="100"
              />
              <button
                className="btn btn-success w-32"
                type="submit"
                //disabled={showHashError || !selectedImage || uploadProgress > 0}
              >
                Upload
              </button>
            </>
          ) : (
            <>
              <div className="btn btn-error w-32" onClick={deleteImage}>
                Delete
              </div>
              <button className="btn btn-warning w-32" type="submit">
                Edit
              </button>
            </>
          )}
        </div>
      </form>

      <div className="view-image">
        <img
          src={
            editHash
              ? '/image/' + editHash
              : selectedImage && URL.createObjectURL(selectedImage)
          }
          className="view-image"
        />
      </div>
    </div>
  )
}

export default UploadEditPage
