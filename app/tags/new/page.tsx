'use client'
import axios, { AxiosRequestConfig } from 'axios'
import Link from 'next/link'
import { notFound, usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState, use } from 'react';
import { Prisma, Tag } from '@prisma/client'

interface Props {
  searchParams: Promise<{
    name: string
  }>
}

const TagViewPage = (props: Props) => {
  const searchParams = use(props.searchParams);
  const router = useRouter()
  const pathname = usePathname()

  const editTag = searchParams.name

  const tagWithParents = Prisma.validator<Prisma.TagDefaultArgs>()({
    include: { parents: true },
  })
  type TagWithParents = Prisma.TagGetPayload<typeof tagWithParents>

  useEffect(() => {
    if (editTag) {
      axios
        .get<TagWithParents>('/api/tags/' + editTag)
        .then((res) => {
          setId(res.data.id)
          setName(res.data.name)
          setParents(res.data.parents.map((parent) => parent.name).join(' '))
          setType(res.data.type)
        })
        .catch(() => {
          notFound()
        })
    } else {
      setId(undefined)
      setName('')
      setParents('')
      setType('TAG')
    }
  }, [pathname, searchParams])

  const [id, setId] = useState<number>()
  const [name, setName] = useState('')
  const [parents, setParents] = useState('')
  const [type, setType] = useState('TAG')

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const options: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
    axios
      .post<Tag>('/api/tags/new', formData, options)
      .then((res) => {
        console.log('NEW TAG SUCCESS')
        console.log(res.data)
        router.push('/tags/' + res.data.type)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const edit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const options: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
    axios
      .patch<Tag>('/api/tags/edit/' + id, formData, options)
      .then((res) => {
        console.log('EDIT TAG SUCCESS')
        console.log(res.data)
        router.push('/tags/' + res.data.type)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const deleteTag = () => {
    axios
      .delete('/api/tags/delete/' + name)
      .then(() => {
        router.push('/tags/' + type)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div role="tablist" className="tabs tabs-boxed">
        <Link href="/tags/" role="tab" className="tab">
          All
        </Link>
        <Link href="/tags/tag" role="tab" className="tab">
          Tags
        </Link>
        <Link href="/tags/artist" role="tab" className="tab">
          Artists
        </Link>
        <Link href="/tags/series" role="tab" className="tab">
          Series
        </Link>
        <Link href="/tags/character" role="tab" className="tab">
          Characters
        </Link>
        <Link href="/tags/info" role="tab" className="tab">
          Info
        </Link>

        <Link href="/tags/new" role="tab" className="tab tab-active">
          New Tag
        </Link>
      </div>

      <div className="flex justify-center">
        <form
          className="grid grid-cols-1 flex-grow gap-y-2 content-start  uploadbar"
          onSubmit={editTag ? edit : create}
        >
          <div className="join">
            <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
              Name
            </div>
            <input
              name="name"
              type="text"
              className="input w-full bg-base-200 join-item"
              spellCheck={false}
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value)
              }}
            />
          </div>

          <div className="join">
            <div className="bg-base-300 rounded-lg px-6 py-3 w-32 join-item">
              Parents
            </div>
            <input
              name="parents"
              type="text"
              className="input w-full bg-base-200 join-item"
              spellCheck={false}
              autoComplete="off"
              value={parents}
              onChange={(e) => {
                setParents(e.currentTarget.value)
              }}
            />
          </div>

          <label className="label cursor-pointer">
            <span className="label-text">Tag</span>
            <input
              type="radio"
              name="type"
              className="radio"
              value="TAG"
              checked={type === 'TAG'}
              onChange={(e) => {
                setType(e.currentTarget.value)
              }}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Artist</span>
            <input
              type="radio"
              name="type"
              className="radio checked:bg-red-600"
              value="ARTIST"
              checked={type === 'ARTIST'}
              onChange={(e) => {
                setType(e.currentTarget.value)
              }}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Series</span>
            <input
              type="radio"
              name="type"
              className="radio checked:bg-violet-600"
              value="SERIES"
              checked={type === 'SERIES'}
              onChange={(e) => {
                setType(e.currentTarget.value)
              }}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Character</span>
            <input
              type="radio"
              name="type"
              className="radio checked:bg-green-600"
              value="CHARACTER"
              checked={type === 'CHARACTER'}
              onChange={(e) => {
                setType(e.currentTarget.value)
              }}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Info</span>
            <input
              type="radio"
              name="type"
              className="radio checked:bg-amber-600"
              value="INFO"
              checked={type === 'INFO'}
              onChange={(e) => {
                setType(e.currentTarget.value)
              }}
            />
          </label>

          <div className="flex gap-x-2 items-end justify-between">
            {!editTag ? (
              <>
                <div />
                <button className="btn btn-success w-32" type="submit">
                  Create
                </button>
              </>
            ) : (
              <>
                <div className="btn btn-error w-32" onClick={deleteTag}>
                  Delete
                </div>
                <div className="flex gap-x-2">
                  <Link className="btn w-32" href={'/tags/' + type}>
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
      </div>
    </div>
  )
}

export default TagViewPage
