
export interface chatStylesI{
  borderStyle: {
    border: string,
  },
  scrollStyle: {
    overflow: string,
    "&::-webkit-scrollbar": {
      width: number
    },
    "&::-webkit-scrollbar-track": {
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: string
      borderRadius: number
    },
    overflowAnchor: string,
    overflowX: string,
  },
  textElipsis: {
    overflow: string,
    textOverflow: string,
    display: string,
    WebkitLineClamp: number,
    WebkitBoxOrient: string
  }

}

export const chatStyles:chatStylesI = {
  borderStyle: {
    border: "2px solid rgba(0,0,0,0.2)",
  },
  scrollStyle: {
    overflow: 'scroll',
    "&::-webkit-scrollbar": {
      width: 3
    },
    "&::-webkit-scrollbar-track": {
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: '',
      borderRadius: 2
    },
    overflowAnchor: 'none',
    overflowX: "hidden",
  },
  textElipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical"
  }
}