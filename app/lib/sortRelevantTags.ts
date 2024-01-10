const sortRelevantTags = (input: string, data: string[]) => {
  var first = []
  var others = []
  for (var i = 0; i < data.length; i++) {
    if (data[i].indexOf(input) == 0) {
      first.push(data[i])
    } else {
      others.push(data[i])
    }
  }
  first.sort()
  others.sort()
  return first.concat(others)
}

export default sortRelevantTags
