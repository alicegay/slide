'use client'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import md5 from 'md5'
import Link from 'next/link'
import axios, { AxiosRequestConfig } from 'axios'
import { notFound, useRouter, usePathname } from 'next/navigation'
import { Prisma } from '@prisma/client'
import sortRelevantTags from '../lib/sortRelevantTags'

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
  const router = useRouter()
  const pathname = usePathname()

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
          setTags(
            res.data.tags
              .map((tag) => tag.name)
              .filter((tag) => tag !== 'safe' && tag !== 'explicit')
              .join(' ') + ' ',
          )
        })
        .catch(() => {
          notFound()
        })
    }
  }, [pathname, searchParams])

  const [selectedImage, setSelectedImage] = useState<File>()
  const [hash, setHash] = useState<string>()
  const [showHashError, setShowHashError] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editImage, setEditImage] = useState<ImageWithTags>()
  const [error, setError] = useState<string>()

  const [tags, setTags] = useState<string>('')
  const [explicit, setExplicit] = useState(false)

  useEffect(() => {
    setSelectedImage(undefined)
    setHash(undefined)
    setShowHashError(false)
    setUploadProgress(0)
    setExplicit(false)
    setEditImage(undefined)
    setError(undefined)
  }, [pathname, searchParams])

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

  const tagAmount = 8
  const tagsRef = useRef<HTMLTextAreaElement>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [lastTag, setLastTag] = useState<string>('')
  const suRef = [...Array(tagAmount)].map(() => useRef<HTMLDivElement>(null))
  useEffect(() => {
    axios
      .get('/api/tags')
      .then((res) => {
        setAllTags(res.data)
      })
      .catch((error) => {
        console.warn('Failed to retrieve tags')
        console.warn(error)
      })
  }, [])

  useEffect(() => {
    if (tags) {
      const t = tags.split(' ')[tags.split(' ').length - 1]
      setLastTag(t)
    } else setLastTag('')
  }, [tags])

  const updateLastTag = (tag: string) => {
    const sp = tags!.split(' ')
    const sl = sp.slice(0, sp.length - 1)
    setTags([...sl, tag].join(' ') + ' ')
  }

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
        setUploadProgress(0)
        if (error.response.data && error.response.data.error)
          setError('Upload Error:   ' + error.response.data.error)
        else setError('Error: ' + error.response.status)
      })
  }

  const edit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const options: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
    axios
      .patch('/api/edit/' + editHash, formData)
      .then((res) => {
        console.log('EDIT SUCCESS')
        setError(undefined)
        router.push('/view/' + editHash)
      })
      .catch((error) => {
        console.warn(error)
        if (error.response.data && error.response.data.error)
          setError('Error:   ' + error.response.data.error)
        else setError('Error: ' + error.response.status)
      })
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
          <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
            Hash
          </div>
          <div className="input w-full bg-base-200 join-item pt-3">{hash}</div>
        </div>

        <div className="dropdown w-full">
          <textarea
            ref={tagsRef}
            name="tags"
            className="textarea w-full bg-base-200"
            placeholder="Tags"
            spellCheck={false}
            autoComplete="off"
            value={tags}
            onChange={(e) => {
              setTags(e.currentTarget.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                suRef[0].current?.focus()
              } else if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
          />
          {lastTag.length >= 3 && (
            <ul className="absolute z-[1] menu p-2 shadow bg-base-300 rounded-box">
              {sortRelevantTags(
                lastTag,
                allTags.filter((tag) => tag.includes(lastTag)),
              )
                .slice(0, tagAmount)
                .map((tag, i, a) => (
                  <li key={i}>
                    <div
                      ref={suRef[i]}
                      tabIndex={0}
                      onClick={() => {
                        updateLastTag(tag)
                        tagsRef.current!.select()
                      }}
                      onKeyDown={(e) => {
                        e.preventDefault()
                        if (e.key === 'Enter') {
                          updateLastTag(tag)
                          tagsRef.current!.select()
                        } else if (e.key === 'ArrowDown') {
                          const r = i >= a.length - 1 ? 0 : i + 1
                          suRef[r].current?.focus()
                        } else if (e.key === 'ArrowUp') {
                          const r = i <= 0 ? a.length - 1 : i - 1
                          suRef[r].current?.focus()
                        } else if (e.key === 'Escape') {
                          tagsRef.current!.select()
                          tagsRef.current!.setSelectionRange(
                            tags!.length,
                            tags!.length,
                          )
                        } else if (e.key === 'Backspace') {
                          tagsRef.current!.select()
                          tagsRef.current!.setSelectionRange(
                            tags!.length - lastTag.length,
                            tags!.length,
                          )
                        }
                      }}
                    >
                      {tag}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex gap-x-2 items-center">
          <label className="label cursor-pointer w-full">
            <span className="label-text">Explicit</span>
            <input
              name="explicit"
              type="checkbox"
              className="toggle toggle-error"
              checked={explicit}
              onChange={() => {
                setExplicit(!explicit)
              }}
            />
          </label>
          <div
            className="btn btn-sm w-32"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(tagsRef.current!.value)
                console.log('COPIED')
              } catch (error) {
                tagsRef.current!.select()
                document.execCommand('copy')
                console.log('COPIED (BACKUP)')
              }
            }}
          >
            Copy Tags
          </div>
        </div>

        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
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

        <div className="join">
          <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
            Parent
          </div>
          <input
            name="parent"
            type="text"
            className="input w-full bg-base-200 join-item"
            spellCheck={false}
            autoComplete="off"
            defaultValue={(editHash && editImage?.parentHash) ?? undefined}
          />
        </div>

        <div className="collapse bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title font-medium text-center">More...</div>
          <div className="collapse-content grid grid-cols-1 flex-grow gap-y-2 content-start">
            <div className="join">
              <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
                Title
              </div>
              <input
                name="title"
                type="text"
                className="input w-full bg-base-100 join-item"
                autoComplete="off"
                defaultValue={(editHash && editImage?.title) ?? undefined}
              />
            </div>

            <textarea
              name="description"
              className="textarea w-full bg-base-100"
              placeholder="Description"
              autoComplete="off"
              defaultValue={(editHash && editImage?.description) ?? undefined}
            />

            <textarea
              name="translation"
              className="textarea w-full bg-base-100"
              placeholder="Translation"
              autoComplete="off"
              defaultValue={(editHash && editImage?.translation) ?? undefined}
            />
          </div>
        </div>

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
                disabled={showHashError || !selectedImage || uploadProgress > 0}
              >
                {uploadProgress > 0 ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  'Upload'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="btn btn-error w-32" onClick={deleteImage}>
                Delete
              </div>
              <div className="flex gap-x-2">
                <Link className="btn w-32" href={'/view/' + editHash}>
                  Cancel
                </Link>
                <button className="btn btn-warning w-32" type="submit">
                  Edit
                </button>
              </div>
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
