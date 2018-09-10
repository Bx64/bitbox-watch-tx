import * as React from 'react'

const Transaction = (props) => (
  <a href={`https://explorer.bitcoin.com/bch/tx/${props.id}`} target="_blank">{props.id}</a>
)

export default Transaction