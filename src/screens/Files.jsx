import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, BackHandler, TouchableWithoutFeedback, ScrollView, ToastAndroid, TextInput, Platform, PermissionsAndroid } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import tw from '../customTwrnc';
import Icon from 'react-native-vector-icons/Ionicons';
import * as COLORS from '../contants/COLORS';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL } from '../contants/URLS';
import { StackContext } from '../providers/StackProvider';

const icons = {
    pdf: require('../img/pdf-icons.png'),
    video: require('../img/video-icon.png'),
    audio: require('../img/audio-icon.png'),
}

const Storage = () => {
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedItems, setSelectedItem] = useState(undefined);

    const navigation = useNavigation();
    const router = useRoute();





    const getFolders = async (path) => {
       
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/files-by-type?type=${router.params.type}`)
            setDirectory(res.data);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error.message)
        }
    };

    useEffect(() => {


        getFolders(router.params.path);

    }, [router.params.path]);

    const handleOpen = (item) => {
        
    };

   

    const handleOpenMenu = (e, items) => {
        const { pageY } = e.nativeEvent;
        items.y = pageY;
        setSelectedItem(items);
    }



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
            if (item.isFolder) {
                deleteFolder(item.path);
            } else {
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

        <TouchableWithoutFeedback onPress={() => { setSelectedItem(undefined) }}>

            <View style={tw`flex-1 bg-[${COLORS.BG_PRIMARY}]`}>
                {/* header  */}
                <View style={tw`w-full py-4 px-3 bg-[${COLORS.BG_SECONDARY}] mb-5 relative z-10`}>
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View style={tw`flex items-center flex-row`}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon name='arrow-back-outline' size={30} color={COLORS.FOREGROUND_PRIMARY} />
                            </TouchableOpacity>
                            <Text style={tw`ml-4 text-[${COLORS.FOREGROUND_PRIMARY}] text-lg`}>{router.params.type?.toUpperCase()}</Text>
                        </View>



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
                    directory.length != 0 && !loading &&
                    <FlatList
                    data={directory}

                    renderItem={({ item }) => (
                        <View style={tw`w-full py-2 px-4 my-2 flex flex-row items-center justify-between relative`}>
                            <TouchableOpacity onPress={() => handleOpen(item)} onLongPress={(e) => handleOpenMenu(e, item)}>
                                <View style={tw`flex items-center flex-row`}>
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
