interface Props {
  params: { tags: string }
}

const SearchPage = ({ params }: Props) => {
  return (
    <>
      {/* <div role="alert" className="alert alert-error mb-4">
        <span>No images found.</span>
      </div> */}

      <div className="grid grid-cols-6 gap-4 mb-4">
        {[...Array(24)].map((e, i) => (
          <div className="skeleton w-auto h-40" key={i} />
        ))}
      </div>

      <div className="join flex justify-center mb-4">
        <button className="join-item btn btn-active">1</button>
        <button className="join-item btn">2</button>
        <button className="join-item btn">3</button>
        <button className="join-item btn">4</button>
        <button className="join-item btn btn-disabled">...</button>
        <button className="join-item btn">135</button>
      </div>

      <div className="flex justify-center">3220 images</div>
    </>
  )
}

export default SearchPage
