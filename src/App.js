import React, { useState, useRef } from 'react'
import AnswerBox from './components/AnswerBox'
import FailBox from './components/FailBox'
import Result from './components/Result'
import Human from './components/Human'
import Instance from './components/instance/index'

export default () => {
  const [wordFromAPI, setWordFromAPI] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [resultBox, setResultBox] = useState({
    disabled: false,
    title: 'Hangman',
    buttonLabel: 'Start Game',
  })
  const [failedLetters, setFailedLetters] = useState([])
  const [correctLetters, setCorrectLetters] = useState([])
  const [word, setWord] = useState('')
  const inputRef = useRef(null)

  const input_letter = event => {
    let keyChar = event.key
    event.preventDefault()
    if (
      wordFromAPI.length > 0 &&
      'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'.indexOf(keyChar) >
        -1
    ) {
      keyChar = keyChar.toUpperCase()
      if (
        !failedLetters.find(x => x === keyChar) &&
        !correctLetters.find(x => x === keyChar)
      ) {
        let failed = true
        wordFromAPI.map( element => {
          if (keyChar === element) {
            const newCorrectLetters = correctLetters.concat(keyChar)
            setCorrectLetters(newCorrectLetters)
            countCorrectLetters(newCorrectLetters)
            failed = false
          }
        })
        if (failed)  {
          setFailedLetters(failedLetters.concat(keyChar))
          if (failedLetters.length === 10) {
            setResultBox({
              disabled: false,
              title: `Game Over { word: ${word} }`,
              buttonLabel: 'New Word',
            })
            setIsGameOver(true)
          }
        }
      }
    }
  }

  const emptyBoxList = () => {
    let arrayOfSpace = []
    if (wordFromAPI.length > 0) {
      const arraySize = wordFromAPI.length
      for (let x = 0; x < 12 - arraySize; x++) {
        arrayOfSpace.push(' ')
      }
    }
    return arrayOfSpace
  }

  const startGame = () => {
    setResultBox({
      disabled: true,
    })
    setFailedLetters([])
    setCorrectLetters([])
    setWordFromAPI([])
    setWord('')
    getDataFromAPI()
    setIsGameOver(false)
    inputRef.current.focus()
  }

  const continueGame = () => {
    setResultBox({
      disabled: true,
    })
    inputRef.current.focus()
  }

  const wordSetter = word => {
    let wordArr = word.toUpperCase().split('')
    wordArr.map(item => {
      item === '-' && wordArr.splice(wordArr.indexOf('-'), 1)
      item === ' ' && wordArr.splice(wordArr.indexOf(' '), 1)
      return item
    })

    setWordFromAPI(wordArr)
    setWord(word)
  }

  const getDataFromAPI = async () => {
    await Instance.get_randomword()
      .then(response => {
        console.log("randword",response.data[0].word)
        wordSetter(response.data[0].word)
        return response.status
      })
      .catch(error => {
        console.log(error)
      })
  }

  const countCorrectLetters = correctLetters => {
    let uniqueLetters = filterUniqueItems(wordFromAPI)
    if (correctLetters.length === uniqueLetters.length) {
      setResultBox({
        disabled: false,
        title: '★ You Won! ★',
        buttonLabel: 'Restart Game',
      })
      setIsGameOver(true)
    }
  }

  const filterUniqueItems = items => {
    const obj = {},
    uniqueItems = []
    items.map(item=>{
    !(obj.hasOwnProperty(item)) &&  uniqueItems.push(item)
    obj[item] = 1
    })
    console.log("uniqueItems",uniqueItems) 
    return uniqueItems
  }

  return (
    <div className ="AppWrapper">
      <div className = "GameInstruction"> Press any letters to play.</div>
      <div className = "Gallow">
        <div className="DownPipe" />
        <input
          className='input'
          ref={inputRef}
          {...(!isGameOver && !isPaused && { onKeyDown: input_letter })}
          onFocus={() => setIsPaused(false)}
          onBlur={() => {
            if (!isGameOver) {
              setIsPaused(true)
              setResultBox({
                title: 'Game is Paused',
                disabled: false,
                buttonLabel: 'continue',
              })
            }
          }}
        />
      </div>
      <Human failedLetterCount={failedLetters.length} />

      <FailBox failedLetters={failedLetters} />
      <AnswerBox
        wordFromAPI={wordFromAPI}
        correctLetters={correctLetters}
        spaces={emptyBoxList()}
      />

      <div className = "RightBlueTriangle" />
      <Result
        title={resultBox.title}
        disabled={resultBox.disabled}
        buttonLabel={resultBox.buttonLabel}
        buttonAction={isPaused ? continueGame : startGame}
      />
      {!isPaused && <button className='button pause'> Pause Game</button>}
    </div>
  )
}
