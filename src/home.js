import React from "react";
import { useState, useEffect } from "react";
import { useCallback } from "react";
import axios from 'axios';
import Slider from "react-slick";
import {
  AppBar, Avatar, Button, Card, CardActionArea, CardContent, 
  CardMedia, CircularProgress, Container, Grid, Table, TableBody, 
  Toolbar, TableCell, TableContainer, TableHead, TableRow, Typography, Paper
} from '@mui/material';
import { common } from '@mui/material/colors';
import { useDropzone } from 'react-dropzone';
import alnour from "./alnour.png";
import background from "./brains.png";
import Clear from '@mui/icons-material/Clear';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/500.css';
import '@fontsource/baloo-2';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './index.css';
import CloudUpload from '@mui/icons-material/CloudUpload';


const ColorButton = (props) => (
  <Button
    {...props}
    sx={{
      color: (theme) => theme.palette.getContrastText(common.white),
      backgroundColor: common.white,
      '&:hover': {
        backgroundColor: '#ffffff7a',
      },
    }}
  />
);

function Arrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "transparent" }}
      onClick={onClick}
    />
  );
}

const ImageCarousel = ({ preview }) => {
  const settings = {
    dots: false,
    infinite: false,
    lazyLoad: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <Arrow />,
    prevArrow: <Arrow />
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {Array.isArray(preview) && preview.map((img, index) => (
          <div key={index} >
            <CardMedia
              sx={{ width: '4500px', height: '100%', objectFit: 'contain'}}
              image={img}
              component="img"
              title={`Preview ${index + 1}`}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};



const MyDropzone = ({ onSelectFile }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {'application/octet-stream': ['.nrrd'], 'image/png': ['.png']},
    maxSize: 10000000000,
    onDrop: (acceptedFiles) => {
      onSelectFile(acceptedFiles);
    },
  });

  return (
    <div
      {...getRootProps()}
      style={{
        width: '568px',
        height: '568px',
        border: '1px dashed black',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column', // Align items in column to place icon below text
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      <input {...getInputProps()} />
      <p style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Baloo 2'", color: '#f5f5f5' }}>
        Upload an anonymized DICOM file. CTA Brain/Head/Head&Neck all accepted.
      </p>
      <CloudUpload sx={{ fontSize: 60, color: '#f5f5f5', marginTop: '20px' }} />
    </div>
  );
};

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState([]);
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [data, setData] = useState({ aneurysm_count: null, aneurysm_preview: [] });
  const [x, setX] = useState(true);
  const [p, setP] = useState(false);

  const sendFile = useCallback(async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
  
      const apiUrl = process.env.REACT_APP_API_URL || 'http://34.236.134.92/predict';
  
      let res = await axios({
        method: "post",
        url: apiUrl,
        data: formData,
      });
  
      if (res.status === 200) {
        const {aneurysm_preview} = res.data
        const base64_preview = aneurysm_preview.map(file => `data:image/png;base64,${file}`);

        setData(res.data);
        setPreview(base64_preview);
        setP(false);
      }
      setIsloading(false);
      setImage(false);
    }
  }, [selectedFile, image]);

  const clearData = () => {
    setData({ aneurysm_count: null, aneurysm_preview: [] });
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
    setX(true);
    setP(false);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const TransparentImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/AtLPgkAAAAASUVORK5CYII='
    setPreview(TransparentImage);
    setP(true);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview && image) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview, sendFile, image]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData({ aneurysm_count: null, aneurysm_preview: [] });
      return;
    }
    setSelectedFile(files[0]);
    setData({ aneurysm_count: null, aneurysm_preview: [] });
    setImage(true);
    setX(false);
  };

  return (
    <React.Fragment>
      <AppBar position="static" sx={{ background: '#ffd642', boxShadow: 'none', color: 'white' }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ fontSize: '35px', fontWeight: 500, fontFamily: "'Baloo 2'" }}>
            alnour AI: Automatic Brain Aneurysm Detection
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Avatar src={alnour} sx={{ width: 56, height: 56, borderRadius: '300px' }} />
        </Toolbar>
      </AppBar>

      <div style={{
        backgroundImage: `url(${background})`, 
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover', 
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: -1,
      }}></div>

      <Container maxWidth={false} disableGutters={true}>
        <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ padding: "4em 1em 0 1em" }}>
          <Grid item xs={12}>
            <Card sx={{ maxWidth: '600px', height: '600px', margin: 'auto', backgroundColor: 'transparent', boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important', borderRadius: '15px' }}>
              {p && (
                <CardActionArea>
                  <CardMedia
                    component="img"
                    image={preview}
                    title="Processing"
                    sx={{ height: 480 }}
                  />
                </CardActionArea>
              )}
              {Array.isArray(preview) && preview.length > 0 &&(
                <CardContent sx={{height: '75%', display: 'flex', flexDirection: 'column', alignItems: 'top', justifyItems: 'center'}}>
                  <ImageCarousel preview={preview} />
                </CardContent>
              )}
              {!image && x && (
                <CardContent>
                  <MyDropzone onSelectFile={onSelectFile} />
                </CardContent>
              )}
              {data.aneurysm_count !== null && (
                <CardContent sx={{ maxWidth: 600, height: '110px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', paddingBottom: '0px' }}>
                  <TableContainer component={Paper} sx={{ height: '110px', backgroundColor: 'white', boxShadow: 'none !important' }}>
                    <Table size="small">
                      <TableHead sx={{ height: '20px', backgroundColor: 'white' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', fontSize: '35px', fontFamily: "'Baloo 2'", borderBottom: 'none', paddingY: '6px'}}>
                            Aneurysm (&gt; 1.5 mm) Count:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{ height: '20px', backgroundColor: 'white' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', fontSize: '35px', fontWeight: 'bold', fontFamily: "'Baloo 2'", borderBottom: 'none', paddingY: '5px' }}>
                            {data.aneurysm_count}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
              {isLoading && data.aneurysm_count == null && (
                <CardContent sx={{ maxWidth: 600, height: '110px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px', paddingBottom: '0px' }}>
                  <TableContainer component={Paper} sx={{ height: '110px', backgroundColor: 'white', boxShadow: 'none !important'}}>
                    <Table size="small" sx={{ height: '110px !important', paddingBottom: '0px'}}>
                      <TableHead sx={{ height: '10px', backgroundColor: 'white' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ borderBottom: 'none', paddingY: '0px'}}>
                            <CircularProgress sx={{ color: '#ffd642 !important' }} />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{ height: '10px', backgroundColor: 'white' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ borderBottom: 'none', paddingY: '0px'}}>
                            <Typography variant="h6" noWrap sx={{ fontSize: '35px', fontWeight: 500, fontFamily: "'Baloo 2'" }}>
                              Processing
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && data.aneurysm_count !== null && (
            <Grid item sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <ColorButton
                variant="contained"
                color="primary"
                size="large"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
                sx={{
                  width: "-webkit-fill-available",
                  borderRadius: '15px',
                  color: '#000000a6',
                  fontSize: "20px",
                  fontFamily: "'Baloo 2'",
                }}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default ImageUpload;
