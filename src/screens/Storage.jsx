import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, BackHandler, TouchableWithoutFeedback, ScrollView, ToastAndroid, TextInput, Platform, PermissionsAndroid } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import tw from '../customTwrnc';
import Icon from 'react-native-vector-icons/Ionicons';
import * as COLORS from '../contants/COLORS';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL } from '../contants/URLS';
import { StackContext } from '../providers/StackProvider';
import DocumentPicker from 'react-native-document-picker';
import Button from '../components/Button';
import RNFS from 'react-native-fs';
import RNGRP from 'react-native-get-real-path';
import SoundPlayer from 'react-native-sound-player'

const icons = {
    pdf: require('../img/pdf-icons.png'),
    video: require('../img/video-icon.png'),
    audio: require('../img/audio-icon.png'),
    phone: require('../img/phone-icon.png'),
    whatsapp: require('../img/whatsapp-icon.png'),
    skype: require('../img/skype-icon.png'),
}


const Storage = () => {
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openmenu, setOpenMenu] = useState(false);
    const [openCreateFolder, setOpenCreateFolder] = useState(false);
    const [selectedItems, setSelectedItem] = useState(undefined);
    const [foldername, setFolderName] = useState('');
    const navigation = useNavigation();
    const { history, setHistory } = useContext(StackContext);
    const router = useRoute();

    

    const getFolders = async (path) => {
        console.log(path)
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/folder?folderPath=${path || ''}`);
            setDirectory(res.data);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {


        getFolders(router.params.path);


        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);

        console.log(history)
        return () => backHandler.remove(); // Clean up the event listener
    }, [router.params.path]);



    const playAudio = async (url) => {
        try {
            
 
            SoundPlayer.playUrl(url)
           
        } catch (e) {
            console.log(`cannot play the sound file`, e)
        }
    }

    const handleOpen = (item) => {
       
        if (!item.isFolder){
            if(item.type.includes('audio')){
                console.log('ssss')
                playAudio(`${BACKEND_URL}${item.public_url}`)
            }
            if(item.isTranscribed){
                navigation.navigate('FileText', { transcribePath: item.transcribePath })
            }
        }else{
            setHistory((prev) => [...prev, router.params?.path]);
            navigation.navigate('Storage', { path: item.path });
        };
        
        
    };

    const handleBack = () => {

        let path;
        setHistory((prev) => {
            const copy = [...prev];
            path = copy.length === 0 ? 'home' : copy.pop(); // Get the previous path
            return copy;
        });



        if (path === 'home') {
            navigation.goBack(); // Go back to the home page
        } else {
            navigation.navigate('Storage', { path }); // Navigate to the previous folder
        }

        return true; // Prevent default back action
    };

    const handleOpenMenu = (e, items) => {
        const { pageY } = e.nativeEvent;
        items.y = pageY;
        setSelectedItem(items);
    }

    const createFolder = async () => {
        try {
            if (!foldername) {
                ToastAndroid.show('Please Enter Folder Name', ToastAndroid.SHORT);
            }
            const res = await axios.post(`${BACKEND_URL}/api/folder`, {
                folderPath: router.params.path || '',
                folderName: foldername
            });

            setOpenCreateFolder(false);
            setFolderName('');
            ToastAndroid.show(res.data?.message, ToastAndroid.SHORT)
            getFolders(router.params.path);

        } catch (error) {
            console.log(error.message)
        }
    }


    const handleFileUpload = async () => {
        console.log('calliong')
        setLoading(true)
       
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: true
            });

            let response;


            for (let index = 0; index < res.length; index++) {
                const file = res[index];


                const formData = new FormData();
                formData.append('file', {
                    uri: file.uri,
                    type: file.type,
                    name: file.name,
                });
                formData.append('filename', file.name);
                formData.append('birthdate', '2024-12-20');
                formData.append('filepath', router.params.path || '');

                response = await axios.post(`${BACKEND_URL}/api/file`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
            }

            

            getFolders(router.params.path);
            setOpenMenu(false);

            ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                ToastAndroid.show('User cancelled the picker', ToastAndroid.SHORT);
            } else {
                console.error('Error:', err.message,err.response.data);
            }
        }
        setLoading(false)
        console.log('end')
    };


    const deleteFile = async (filepath) => {
       
        try {
            const res = await axios.delete(`${BACKEND_URL}/api/file?filePath=${filepath}`);
         
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        } catch (error) {
            console.log(error.message)
        }
    }

    const deleteFolder = async (filepath) => {
        try {
            const res = await axios.delete(`${BACKEND_URL}/api/folder?folderPath=${filepath}`);
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleDelete = async (item) => {
        console.log('calling')
        setLoading(true)
        try {
            if(item.isFolder){
                deleteFolder(item.path);
            }else{
                deleteFile(item.path);
            }

            getFolders(router.params.path);
            setSelectedItem(undefined);
        } catch (error) {
           console.log(error.message) 
        }
        setLoading(false)
    }



    if (loading) {
        return (
            <View style={tw`flex-1 bg-[${COLORS.BG_PRIMARY}] flex items-center justify-center`}>
                <ActivityIndicator color={COLORS.FOREGROUND_SECONDARY} size={70} />
            </View>
        );
    }

    return (

        <TouchableWithoutFeedback onPress={() => { setOpenMenu(false); setSelectedItem(undefined) }}>

            <View style={tw`flex-1 bg-[${COLORS.BG_PRIMARY}]`}>
                {/* header  */}
                <View style={tw`w-full py-4 px-3 bg-[${COLORS.BG_SECONDARY}] mb-5 relative z-10`}>
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View style={tw`flex items-center flex-row`}>
                            <TouchableOpacity onPress={handleBack}>
                                <Icon name='arrow-back-outline' size={30} color={COLORS.FOREGROUND_PRIMARY} />
                            </TouchableOpacity>
                            <Text style={tw`ml-4 text-[${COLORS.FOREGROUND_PRIMARY}] text-lg`}>CLOUD STORAGE</Text>
                        </View>

                        <TouchableOpacity style={tw`relative`} onPress={() => setOpenMenu(!openmenu)}>
                            <Icon name='ellipsis-vertical' color={COLORS.FOREGROUND_PRIMARY} size={25} />

                        </TouchableOpacity>
                        {
                            openmenu &&
                            <View style={tw`w-[10rem] bg-[${COLORS.BG_THIRD}] absolute right-1 top-8 rounded-md flex px-4 py-2`}>
                                <TouchableOpacity onPress={() => { setOpenCreateFolder(true); setOpenMenu(false) }}>
                                    <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] my-2`}>Create Folder</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleFileUpload}>
                                    <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] my-2`}>Upload File</Text>
                                </TouchableOpacity>
                            </View>
                        }

                    </View>

                    <View style={tw`mt-4 px-2`}>
                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-xs`}>{`CLOUD STORAGE   ${router.params.path ? '>' : ''}  `} {router.params.path?.replace('/root/file-manager-api/eligindi/','')?.replace('/','  >  ')}</Text>
                    </View>
                </View>




                {/* this is menu  */}
                {
                    selectedItems &&
                    <View style={tw.style(`w-[10rem] bg-[${COLORS.BG_THIRD}] absolute right-10 rounded-md flex px-4 py-2 z-10`, { top: selectedItems?.y + 10 })}>
                        <TouchableOpacity onPress={() => handleDelete(selectedItems)}>
                            <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] my-2`}>delete</Text>
                        </TouchableOpacity>
                    </View>

                }


                {
                    openCreateFolder &&
                    <View style={tw`absolute top-0 left-0 right-0 bottom-0  z-20 flex items-center justify-center`}>
                        <View style={tw.style(`w-[20rem] bg-[${COLORS.BG_THIRD}] rounded-md flex px-4 py-4 shadow-md z-10`)}>
                            <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-center text-xl`}>New Folder</Text>
                            <TextInput placeholder='Folder Name' value={foldername} onChangeText={setFolderName} style={tw`w-full py-2 px-4 bg-[${COLORS.BG_SECONDARY}] rounded-md my-4`} />

                            <Button bgcolor={COLORS.FOREGROUND_SECONDARY} textcolor={COLORS.FOREGROUND_PRIMARY} onPress={createFolder}>Create Folder</Button>
                            <Button bgcolor={'transparent'} textcolor={COLORS.FOREGROUND_PRIMARY} classes={`border border-gray-400`} onPress={() => setOpenCreateFolder(false)}>Cancel</Button>
                        </View>
                    </View>
                }


                {
                    directory.length != 0 && !loading &&
                    <FlatList
                    data={directory}

                    renderItem={({ item }) => (
                        <View style={tw`w-full py-2 px-4 my-2 flex flex-row items-center justify-between relative`}>
                            <TouchableOpacity onPress={() => handleOpen(item)} onLongPress={(e) => handleOpenMenu(e, item)}>
                                <View style={tw`flex items-center flex-row`}>
                                    {
                                        item?.isTranscribed ?
                                        <>
                                            {
                                                        !item.isFolder && item.platform == 'phone' ?

                                                            <Image
                                                                source={icons.phone}
                                                                style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                                            />
                                                            : !item.isFolder && item.platform == 'whatsapp' ?
                                                                <Image
                                                                    source={icons.whatsapp}
                                                                    style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                                                />
                                                                : !item.isFolder && item.platform == 'skype' ?
                                                                    <Image
                                                                        source={icons.skype}
                                                                        style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                                                    />
                                                                    : !item.isFolder ?
                                                                        <Image
                                                                            source={icons.audio}
                                                                            style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                                                        />
                                                                        :
                                                                        null

                                                    }
                                        </>
                                        :
                                        <>
                                        {
                                        !item.isFolder && item.type.includes('pdf') ?

                                        <Image
                                            source={icons.pdf}
                                            style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                        />
                                        : !item.isFolder && item.type.includes('image') ?
                                        <Image
                                            source={{ uri: `${BACKEND_URL}${item.public_url}` }}
                                            style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                        />
                                        : !item.isFolder && item.type.includes('video') ?
                                        <Image
                                            source={icons.video}
                                            style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                        />
                                        : !item.isFolder && item.type.includes('audio') ?
                                        <Image
                                            source={icons.audio}
                                            style={tw.style(`rounded-sm`, { width: 35, height: 35, resizeMode: 'cover' })}
                                        />
                                        : !item.isFolder ? 
                                        <Icon name='document-outline' color={COLORS.FOREGROUND_PRIMARY} size={30} />
                                        :
                                        null

                                    }
                                        </>
                                    }
                                    
                                    {item.isFolder && <Icon name='folder-outline' color={COLORS.FOREGROUND_PRIMARY} size={30} />}

                    

                                    
                                    <View>
                                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-lg ml-4`}>{item?.name?.slice(0,20)}</Text>
                                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-md ml-4 opacity-60`}>
                                            {!item?.isFolder ? `${item.size}MB, ` : ''} {item?.date}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => handleOpenMenu(e, item)}>
                                <Icon name='ellipsis-vertical' color={COLORS.FOREGROUND_PRIMARY} size={20} />
                            </TouchableOpacity>

                        </View>
                    )}
                />
                }
                

                {
                    directory.length == 0 && !loading &&
                    <View style={tw`flex-1 flex items-center justify-center`}>
                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-xl`}>No item here</Text>
                    </View>
                }


            </View>
        </TouchableWithoutFeedback>

    );
};

export default Storage;
