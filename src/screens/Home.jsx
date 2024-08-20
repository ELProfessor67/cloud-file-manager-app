import { View, Text, Button, FlatList, Image, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from '../customTwrnc'
import { useNavigation } from '@react-navigation/native'
import * as COLORS from '../contants/COLORS'
import Card from '../components/Card'
import axios from 'axios'
import { BACKEND_URL } from '../contants/URLS'

const Home = () => {
  const [images, setImages] = useState([]);
  const [video, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [audios, setAudios] = useState([]);
  const [others, setOthers] = useState([]);
  const [apps, setApps] = useState([]);
  const navigation = useNavigation();

  const getFiles = async (setState, type) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/files-by-type?type=${type}`)
      setState(res.data);
    } catch (error) {
      console.log(error.message)
    }
  }

  const getData = async () => {
    try {
      await Promise.all([getFiles(setImages, 'images'), getFiles(setVideos, 'videos'), getFiles(setAudios, 'audio'), getFiles(setDocuments, 'documents'), getFiles(setOthers, 'others')]);
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    getData(); 
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={tw.style(`flex-1 bg-[${COLORS.BG_PRIMARY}] p-4 py-10`,{minHeight: Dimensions.get('window').height})}>
      {
        images.length != 0 &&
        <>

          <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-2xl mb-5`}>Recent Images</Text>
          <View style={tw`mb-10`}>

            <FlatList
              data={images}
              horizontal={true}
              renderItem={({ item }) => (
                <Image source={{ uri: `${BACKEND_URL}${item.public_url}` }} style={tw.style(``, { width: 150, height: 150, resizeMode: 'cover',marginHorizontal: 2 })} />
              )}
            />
          </View>
        </>
      }

      <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-2xl mb-5`}>Categories</Text>
      <View style={tw`flex flex-wrap items-center justify-center flex-row`}>
        <Card iconname={'images-outline'} title={'Images'} lenght={images.length} onPress={() => navigation.navigate('Files', { type: 'images' })}/>
        <Card iconname={'videocam-outline'} title={'Videos'} lenght={video.length} onPress={() => navigation.navigate('Files', { type: 'videos' })}/>
        <Card iconname={'document-text-outline'} title={'Documents'} lenght={documents.length} onPress={() => navigation.navigate('Files', { type: 'documents' })}/>
        <Card iconname={'musical-notes-outline'} title={'Audios'} lenght={audios.length} onPress={() => navigation.navigate('Files', { type: 'audio' })}/>
        <Card iconname={'folder-outline'} title={'Other'} lenght={others.length} onPress={() => navigation.navigate('Files', { type: 'others' })}/>
        <Card iconname={'apps-outline'} title={'Apps'} lenght={apps.length} onPress={() => navigation.navigate('Files', { type: 'Apps' })}/>
      </View>


      <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-2xl mt-10 mb-5`}>Storage</Text>
      <View style={tw`flex flex-wrap items-center justify-center flex-row`}>
        <Card iconname={'cloud-upload-outline'} title={'Storage'} onPress={() => navigation.navigate('Storage', { path: undefined })} showitems={false}/>
        <Card iconname={'alert-circle-outline'} title={'Transcribe'} showitems={false} onPress={() => navigation.navigate('Transcribe',{path: undefined})}/>
      </View>
    </View>
    </ScrollView>
  )
}

export default Home