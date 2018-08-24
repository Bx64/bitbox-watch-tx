import * as BITBOXCli from 'bitbox-cli/lib/bitbox-cli'
import * as React from 'react'
import Transaction from './Transaction';

const BITBOX = new BITBOXCli.default()
const socket = new BITBOX.Socket()

interface IState {
  addrs: string[]
  input: string
  txs: any[]
}

class App extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props)

    this.state = {
      addrs: [],
      input: '',
      txs: []
    }
  }

  public componentDidMount() {
    socket.listen('transactions', this.handleNewTx)
  }

  public render() {
    return (
      <div>
        <h1>BCH Transaction Watcher Powered by BITBOX</h1>
        <h2>Watching Addresses</h2>
        <form onSubmit={this.handleSubmit}>
          <input
            type='text'
            value={this.state.input}
            onChange={this.handleChangeText}
            placeholder='Watch address [Enter]'
          />
        </form>
        <ul>
          {this.state.addrs.map((addr, idx) =>
            <li key={idx}><p>{addr}</p></li>
          )}
        </ul>
        <h2>Watching transactions</h2>
        <ul>
          {this.state.txs.map((tx, idx) => 
            <li key={idx}><Transaction id={tx.format.txid} /></li>
          )}
        </ul>
      </div>
    )
  }

  private handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const input = this.state.input

    try {
      BITBOX.Address.isMainnetAddress(input)
    } catch {
      return
    }

    if (this.state.addrs.indexOf(input) >= 0) {
      return
    }

    this.setState({
      addrs: this.state.addrs.concat(input),
      input: ''
    })
  }

  private handleChangeText = (event: React.FormEvent<HTMLInputElement>) => 
    this.setState({
      input: event.currentTarget.value
    })

  private handleNewTx = (msg: string) => {
    const tx = JSON.parse(msg)

    let found = false
    // TODO: fix dirty logic
    found:
    for (const addr of this.state.addrs) {
      const legacyAddr = BITBOX.Address.toLegacyAddress(addr)
      for (const output of tx.outputs) {
        found = output.scriptPubKey.addresses.indexOf(legacyAddr) >= 0
        if (found) {
          break found
        }
      }
    }
    if (!found) {
      return
    }

    this.setState({
      txs: this.state.txs.concat(tx)
    })
  }
}

export default App