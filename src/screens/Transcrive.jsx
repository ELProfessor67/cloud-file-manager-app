import { View, Text, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, ToastAndroid, BackHandler } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import tw from '../customTwrnc'
import * as COLORS from '../contants/COLORS'
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL, TOKEN, TRANSCRIBE_URL } from '../contants/URLS';
import { ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import SoundPlayerComponent from '../components/SoundPlayer';
import SoundPlayer from 'react-native-sound-player'
import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import Button from '../components/Button';
import { StackContext } from '../providers/StackProvider';



function parseCustomDateTime(dateTimeStr) {
    // Extract date and time components
    const year = parseInt(dateTimeStr.substring(0, 4));
    const month = parseInt(dateTimeStr.substring(4, 6)) - 1; // Months are 0-based in JS
    const day = parseInt(dateTimeStr.substring(6, 8));
    const hours = parseInt(dateTimeStr.substring(9, 11));
    const minutes = parseInt(dateTimeStr.substring(11, 13));
    const seconds = parseInt(dateTimeStr.substring(13, 15));

    // Create and return the Date object
    return new Date(year, month, day, hours, minutes, seconds);
}


function removeCountryCode(number) {
    if (!number) return undefined
    let numberStr = number.toString();

    // Get the length of the number
    let length = numberStr.length;

    // Check if the length is greater than 10
    if (length > 10) {
        // Return the last 10 digits and the total number of digits
        return numberStr.slice(-10)
    } else {
        // Return the number as is and the total number of digits
        return numberStr
    }
}

const icons = {
    pdf: require('../img/pdf-icons.png'),
    video: require('../img/video-icon.png'),
    audio: require('../img/audio-icon.png'),
    phone: require('../img/phone-icon.png'),
    whatsapp: require('../img/whatsapp-icon.png'),
    skype: require('../img/skype-icon.png'),
}



function groupByDate(dataArray) {
    return dataArray.reduce((result, item) => {
        const date = item.date;
        if (!result[date]) {
            result[date] = [];
        }
        result[date].push(item);
        return result;
    }, {});
}

const Transcrive = () => {
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState();
    const navigation = useNavigation();
    const [callFiles, setCallsFiles] = useState({});
    const [callDirectory, setCallsDirectory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItem] = useState(undefined);
    const [files, setFiles] = useState();
    const [filterFile, setFilterFile] = useState([]);
    const [platItem, setPlayItem] = useState(undefined);
    const [contact, setContact] = useState([]);
    const [openmenu, setOpenMenu] = useState(false);
    const [openCreateFolder, setOpenCreateFolder] = useState(false);
    const [foldername, setFolderName] = useState('');
    const {transcribeHistory, setTranscriveHistory} = useContext(StackContext)

    const router = useRoute();

    const getFolders = async () => {

        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/calls?folderPath=${router?.params?.path || ''}`);
            const files = res.data.filter(data => !data.isFolder);
            const directory = res.data.filter(data => data.isFolder);
            setCallsFiles(groupByDate(files));
            setCallsDirectory(directory);
            setFiles(res.data);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {


        getFolders();
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);

   
        return () => backHandler.remove();
    }, [router.params]);


    const handleOpen = (item) => {
        console.log('hell')
        if (!item.isFolder) {
            if (item.type.includes('audio')) {
                console.log('ssss')
                setPlayItem(item);
            }
        } else {
            setTranscriveHistory((prev) => [...prev, router.params?.path]);
            navigation.navigate('Transcribe', { path: item.path });
        };


    };

    const handleOpenMenu = (e, items) => {
        const { pageY } = e.nativeEvent;
        items.y = pageY;
        setSelectedItem(items);
    }

    const deleteFile = async (filepath) => {

        try {
            const res = await axios.delete(`${BACKEND_URL}/api/file?filePath=${filepath}`);
            getFolders();
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        } catch (error) {
            console.log(error.message)
        }
    }

    const deleteFolder = async (filepath) => {
        try {
            const res = await axios.delete(`${BACKEND_URL}/api/folder?folderPath=${filepath}`);
            getFolders();
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


            setSelectedItem(undefined);
            setLoading(false)
        } catch (error) {
            console.log(error.message)
            setLoading(false)
        }
    }




    const handleFileUpload = async () => {
        console.log('calliong')
        setLoading(true)

        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio],
                allowMultiSelection: true
            });

            let response;





            for (let index = 0; index < res.length; index++) {
                const file = res[index];

                const [platform] = file.name.split('_');
                const [filename,ext] = file.name.split('.');
                let dateinfo, phone;
                if (platform == 'phone') {
                    [_, dateinfo, _, phone] = filename.split('_');
                } else {
                    [_, dateinfo, phone] = filename.split('_');
                }
                console.log(platform, dateinfo, phone)
                let name;
                if (phone) {
                    if (isNaN(phone)) {
                        name = phone
                    } else {
                        let number = removeCountryCode(phone);
                        number = number.replaceAll(' ','');

                        const contactInfo = contact.filter(contact => contact.number?.includes(number));
                        console.log(contactInfo)
                        if (contactInfo.length == 0) {
                            name = phone;
                        } else {
                            name = contactInfo[0].name;
                        }
                    }
                }

                name = name?.replaceAll(' ', '_');
                const date = parseCustomDateTime(dateinfo)
                const filesname = `${name || 'unknown'}/${name || 'unknown'}.${ext}`;


                const formData = new FormData();
                formData.append('files', {
                    uri: file.uri,
                    type: file.type,
                    name: file.name,
                });
                formData.append(`path-${0}`, filesname)
                formData.append(`date-${0}`, (date?.getTime()) || new Date().getTime())
                formData.append(`storepath-${0}`, router.params?.path || '')
                formData.append(`platform-${0}`, platform || 'default');
                console.log(JSON.stringify(formData))


                response = await axios.post(`${TRANSCRIBE_URL}/api/v1/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Cookie': `token=${TOKEN}`
                    },
                });
            }





            getFolders();
            ToastAndroid.show("Upload Successfully", ToastAndroid.SHORT);

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                ToastAndroid.show('User cancelled the picker', ToastAndroid.SHORT);
            } else {
                console.error('Error:', err.message, err?.response?.data);
            }
        }
        setLoading(false)
        console.log('end')
    };

    useEffect(() => {
        if (query) {
            const data = files.filter((file) => file?.name?.toLowerCase()?.includes(query?.toLowerCase()))
            setFilterFile(data)
        } else {
            setFilterFile(files);
        }
    }, [query])


    useEffect(() => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept bare mortal',
        })
            .then((res) => {
                console.log('Permission: ', res);
                Contacts.getAll()
                    .then((contacts) => {
                        // work with contacts

                        let contactsData = [];
                        contacts.forEach(contact => {
                            let number = contact?.phoneNumbers[0]?.number.replaceAll(' ', '');
                            const name = contact.displayName

                            contactsData.push({ number, name })
                        })
                        setContact(contactsData);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((error) => {
                console.error('Permission error: ', error);
            });
    }, [])


    const createFolder = async () => {
        try {
            if (!foldername) {
                ToastAndroid.show('Please Enter Folder Name', ToastAndroid.SHORT);
            }
            const res = await axios.post(`${BACKEND_URL}/api/calls-folder`, {
                folderPath: router.params?.path || '',
                folderName: foldername
            });

            setOpenCreateFolder(false);
            setFolderName('');
            ToastAndroid.show(res.data?.message, ToastAndroid.SHORT)
            getFolders();

        } catch (error) {
            console.log(error.message)
        }
    }
    

    const handleBack = () => {

        let path;
        setTranscriveHistory((prev) => {
            const copy = [...prev];
            path = copy.length === 0 ? 'home' : copy.pop(); // Get the previous path
            return copy;
        });



        if (path === 'home') {
            navigation.goBack(); // Go back to the home page
        } else {
            navigation.navigate('Transcribe', { path }); // Navigate to the previous folder
        }

        return true; // Prevent default back action
    };




    if (loading) {
        return (
            <View style={tw`flex-1 bg-[${COLORS.BG_PRIMARY}] flex items-center justify-center`}>
                <ActivityIndicator color={COLORS.FOREGROUND_SECONDARY} size={70} />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={() => { setSelectedItem(undefined); setOpenMenu(false) }}>
            <View style={tw.style(`flex-1 bg-[${COLORS.BG_PRIMARY}]`)}>
                {/* header  */}
                <View style={tw`w-full py-4 px-3 bg-[${COLORS.BG_SECONDARY}] mb-5 relative z-10`}>
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View style={tw`flex items-center flex-row`}>
                            <TouchableOpacity onPress={handleBack}>
                                <Icon name='arrow-back-outline' size={30} color={COLORS.FOREGROUND_PRIMARY} />
                            </TouchableOpacity>
                            <Text style={tw`ml-4 text-[${COLORS.FOREGROUND_PRIMARY}] text-lg`}>TRANSCRIBE</Text>
                        </View>


                        <View style={tw`flex flex-row items-center`}>
                            {/* <TouchableOpacity style={tw`relative`} onPress={handleFileUpload}>
                                <Icon name={'cloud-upload-outline'} color={COLORS.FOREGROUND_PRIMARY} size={25} />
                            </TouchableOpacity> */}
                            <TouchableOpacity style={tw`relative mr-5`} onPress={() => setSearchOpen(!searchOpen)} >
                                <Icon name={searchOpen ? 'close-outline' : `search-outline`} color={COLORS.FOREGROUND_PRIMARY} size={25} />
                            </TouchableOpacity>
                            <TouchableOpacity style={tw`relative`} onPress={() => setOpenMenu(!openmenu)}>
                                <Icon name='ellipsis-vertical' color={COLORS.FOREGROUND_PRIMARY} size={25} />

                            </TouchableOpacity>
                        </View>

                        {
                            searchOpen &&
                            <View style={tw`w-[20.5rem] bg-[${COLORS.BG_THIRD}] absolute right-11 -top-2 rounded-md flex px-4 py-2 flex-row`}>
                                <TextInput placeholder='Search...' style={{ padding: 0, width: '93%' }} value={query} onChangeText={setQuery} />
                                <TouchableOpacity onPress={() => setSearchOpen(prev => !prev)}>
                                    <Icon name='close-outline' color={COLORS.FOREGROUND_PRIMARY} size={25} />
                                </TouchableOpacity>
                            </View>
                        }

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
                </View>


                {/* sound playter  */}
                {
                    platItem &&
                    <SoundPlayerComponent onClose={() => setPlayItem(undefined)} item={platItem} />
                }

                {/* this is menu  */}
                {
                    selectedItems &&
                    <View style={tw.style(`w-[10rem] bg-[${COLORS.BG_THIRD}] absolute right-10 rounded-md flex px-4 py-2 z-10`, { top: selectedItems?.y + 10 })}>
                        <TouchableOpacity onPress={() => handleDelete(selectedItems)}>
                            <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] my-2`}>delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('FileText', { transcribePath: selectedItems.transcribePath })}>
                            <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] my-2`}>Transcrive</Text>
                        </TouchableOpacity>
                    </View>

                }


                {/* create folder  */}
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
                    callDirectory.length != 0 && !loading &&
                    <View>
                        <FlatList
                            data={callDirectory}

                            renderItem={({ item }) => (
                                <View style={tw`w-full py-2 px-4 my-2 flex flex-row items-center justify-between relative`}>
                                    <TouchableOpacity onPress={() => handleOpen(item)} onLongPress={(e) => handleOpenMenu(e, item)}>
                                        <View style={tw`flex items-center flex-row`}>
                                            {item.isFolder && <Icon name='folder-outline' color={COLORS.FOREGROUND_PRIMARY} size={30} />}




                                            <View>
                                                <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-lg ml-4`}>{item?.name?.slice(0, 20)}</Text>
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
                    </View>

                }




                {
                    Object.keys(callFiles).length != 0 && !loading && !query &&
                    <FlatList
                        data={Object.keys(callFiles)}

                        renderItem={({ item }) => (
                            <View style={tw`px-4`}>
                                <Text style={tw`text-lg text-[${COLORS.FOREGROUND_PRIMARY}] mb-2`}>{item}</Text>
                                <FlatList
                                    data={callFiles[item]}

                                    renderItem={({ item }) => (
                                        <View style={tw`w-full py-2 px-4 my-2 flex flex-row items-center justify-between relative`}>
                                            <TouchableOpacity onPress={() => handleOpen(item)} onLongPress={(e) => handleOpenMenu(e, item)}>
                                                <View style={tw`flex items-center flex-row`}>
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
                                                    {item.isFolder && <Icon name='folder-outline' color={COLORS.FOREGROUND_PRIMARY} size={30} />}




                                                    <View>
                                                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-lg ml-4`}>{item?.name?.split('.')[0]?.replaceAll('_', ' ')?.slice(0, 20)}</Text>
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
                                    )} />
                            </View>
                        )}
                    />
                }


                {
                    Object.keys(callFiles).length == 0 && !loading &&
                    <View style={tw`flex-1 flex items-center justify-center`}>
                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-xl`}>No item here</Text>
                    </View>
                }

                {
                    filterFile?.length == 0 && query &&
                    <View style={tw`flex-1 flex items-center justify-center`}>
                        <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-xl`}>No File</Text>
                    </View>
                }



                {
                    filterFile?.length != 0 && query &&
                    <FlatList
                        data={filterFile}

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
                                            <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-lg ml-4`}>{item?.name?.slice(0, 30)}</Text>
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





            </View>
        </TouchableWithoutFeedback>
    )
}

export default Transcrive