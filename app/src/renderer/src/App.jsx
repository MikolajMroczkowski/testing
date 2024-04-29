import {
  Backdrop,
  Button,
  CircularProgress,
  createTheme,
  CssBaseline, FormControlLabel,
  Grid, Radio, RadioGroup,
  ThemeProvider,
  Typography
} from "@mui/material";
import {useEffect, useState} from "react";

function App() {
  const [envStatus, setEnvStatus] = useState(false)
  const [splitStatus, setSplitStatus] = useState(false)
  const [inputDir, setInputDir] = useState(null)
  const [outputDir, setOutputDir] = useState(null)
  const [model, setModel] = useState("spleeter:2stems")
  useEffect(() => {
    window.electron.ipcRenderer.on("env", (e, env) => {
      setEnvStatus(env.status)
    })
    //window.electron.ipcRenderer.send("check-env")
  }, [])
  useEffect(() => {
    //separate("C:\\Users\\miki\\WebstormProjects\\ytDown\\spleeter\\audio_example.mp3", "C:\\Users\\miki\\WebstormProjects\\ytDown\\spleeter\\test", "spleeter:2stems")
  }, [envStatus])
  const separate = (input, output, model) => {
    if (envStatus) {
      setSplitStatus(true)
      window.electron.ipcRenderer.invoke("split", {input: input, output: output, model: model}).then(() => {
        console.log("OK")
        setSplitStatus(false)
        window.electron.ipcRenderer.send("run-sep",{dir:output})
      })
    }
  }
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
    },
  });
  const modelChange = (e)=>{
    setModel(e.target.value)
  }
  const handleSeparate = ()=>{
    console.log(inputDir,outputDir)
    console.log(model)
    if(inputDir && outputDir){
      //check for command line key chars
      if(inputDir.includes(" ") || outputDir.includes(" ")||inputDir.includes("&") || outputDir.includes("&")){
        alert("Invalid chars in name!, maybe '&' OR ' ' ")
      }
      separate(inputDir,outputDir,model)
    }
    else {
      alert("Select input and output")
    }
  }
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        <>
          <Backdrop
            sx={{color: '#fff', bgcolor: "#000", zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={!envStatus}
          >
            <Grid container justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
              <Grid justifyContent={"center"} item><CircularProgress color="inherit"/></Grid>
              <Grid justifyContent={"center"} item><Typography variant={"h4"}>Preparing...</Typography></Grid>
            </Grid>
          </Backdrop>
          <Backdrop
            sx={{color: '#fff', bgcolor: "#000", zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={splitStatus}
          >
            <Grid container justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
              <Grid justifyContent={"center"} item><CircularProgress color="inherit"/></Grid>
              <Grid justifyContent={"center"} item><Typography variant={"h4"}>Separating...</Typography></Grid>
            </Grid>
          </Backdrop>
        </>
        <Grid container spacing={4} alignItems={"center"} justifyContent={"center"} flexDirection={"column"} height={'100vh'}>
          <Grid item>
            <Button onClick={()=>{
              window.electron.ipcRenderer.invoke("select-input").then((data)=>{
                if(data.filePaths.length>0){
                  console.log(data.filePaths[0])
                  setInputDir(data.filePaths[0])
                }
              })
            }} variant={"contained"}>Select input</Button>
            <Typography display={"inline"} variant={"subtitle1"} paddingX={"10px"}>{inputDir||"NO SELECTED"}</Typography>

          </Grid>
          <Grid item flexDirection={"row"}>
            <Button onClick={()=>{
              window.electron.ipcRenderer.invoke("select-output").then((data)=>{
                if(data.filePaths.length>0){
                  console.log(data.filePaths[0])
                  setOutputDir(data.filePaths[0])
                }
              })
            }} variant={"contained"}>Select Output</Button>
            <Typography display={"inline"} variant={"subtitle1"}  paddingX={"10px"}>{outputDir || "NO SELECTED"}</Typography>

          </Grid>
          <Grid item>
            <Typography>Model:</Typography>
            <RadioGroup
              onChange={modelChange}
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              defaultValue={"spleeter:2stems"}
            >
              <FormControlLabel value="spleeter:2stems" control={<Radio />} label="2 stems" />
              <FormControlLabel value="spleeter:4stems" control={<Radio />} label="4 stems" />
              <FormControlLabel value="spleeter:5stems" control={<Radio />} label="5 stems" />
            </RadioGroup>

          </Grid>
          <Grid item>
            <Button  variant={"contained"} onClick={handleSeparate}>Separate</Button>

          </Grid>

        </Grid>
      </ThemeProvider>
    </>
  )
}

export default App

