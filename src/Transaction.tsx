import * as React from 'react'

interface IProps {
  id: string
}

const Transaction = (props: IProps) => (
  <a href={`https://explorer.bitcoin.com/bch/tx/${props.id}`} target="_blank">{props.id}</a>
)

export default Transaction