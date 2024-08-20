import { View, Text, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, ToastAndroid, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from '../customTwrnc'
import * as COLORS from '../contants/COLORS'
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL, TRANSCRIBE_URL } from '../contants/URLS';
import { ActivityIndicator } from 'react-native';


const highlightSentence = (string, sentenceToHighlight) => {
    return string.toLowerCase().includes(sentenceToHighlight) ? (
      <Text>
        {string.split(sentenceToHighlight).map((part, i) => (
          <Text key={i}>
            {part}
            {i < string.split(sentenceToHighlight).length - 1 && (
              <Text style={tw`text-red-500`}>{sentenceToHighlight}</Text>
            )}
          </Text>
        ))}
      </Text>
    ) : (
      <Text>{string}</Text>
    );
  };


const FileText = () => {
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState();
    const [fileText, setFileText] = useState('');
    const navigation = useNavigation();
    const router = useRoute()
    const [loading, setLoading] = useState(false);

    const getFile = async (path) => {

        setLoading(true);
        try {
            const res = await axios.get(`${TRANSCRIBE_URL}/api/v1/get-file?path=${path}`, {
                headers: {
                    'Cookie': "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjlmOGU0MWJmZjE0NDk2NTM2YzVlOWUiLCJpYXQiOjE3MjI2MTQ2OTcsImV4cCI6MTcyMzkxMDY5N30.iazvLMhX7TUpiiHPWu7U_eIvKmHPV4LbBPiwp5259Qc"
                }
            });
            setFileText(res.data.content);
            setLoading(false);
        } catch (error) {
            console.log(error.message, error.response?.data);
            setLoading(false);
        }
    };

    useEffect(() => {
        const ext = router.params.transcribePath.split('.')[1];
        getFile(router.params.transcribePath?.replace(ext, 'txt'));
    }, []);




    if (loading) {
        return (
            <View style={tw`flex-1 bg-[${COLORS.BG_PRIMARY}] flex items-center justify-center`}>
                <ActivityIndicator color={COLORS.FOREGROUND_SECONDARY} size={70} />
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>


            <View style={tw.style(`flex-1 bg-[${COLORS.BG_PRIMARY}]`, { minHeight: Dimensions.get('window').height })}>
                {/* header  */}
                <View style={tw`w-full py-4 px-3 bg-[${COLORS.BG_SECONDARY}] mb-5 relative z-10`}>
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View style={tw`flex items-center flex-row`}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon name='arrow-back-outline' size={30} color={COLORS.FOREGROUND_PRIMARY} />
                            </TouchableOpacity>
                            <Text style={tw`ml-4 text-[${COLORS.FOREGROUND_PRIMARY}] text-lg`}>TRANSCRIBE</Text>
                        </View>


                        <View style={tw`flex flex-row items-center`}>

                            <TouchableOpacity style={tw`relative ml-5`} onPress={() => setSearchOpen(!searchOpen)} >
                                <Icon name={searchOpen ? 'close-outline' : `search-outline`} color={COLORS.FOREGROUND_PRIMARY} size={25} />
                            </TouchableOpacity>
                        </View>

                        {
                            searchOpen &&
                            <View style={tw`w-[20.5rem] bg-[${COLORS.BG_THIRD}] absolute right-11 -top-2 rounded-md flex px-4 py-2 flex-row`}>
                                <TextInput placeholder='Search...' style={{ padding: 0, width: '93%' }} value={query} onChangeText={setQuery} />
                                <TouchableOpacity>
                                    <Icon name='search-outline' color={COLORS.FOREGROUND_PRIMARY} size={25} />
                                </TouchableOpacity>
                            </View>
                        }

                    </View>
                </View>


                <View style={tw`px-4`}>
                    {
                        fileText && <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-lg leading-7`}>
                            {
                                highlightSentence(fileText.toLowerCase(),query.toLowerCase())
                            }
                        </Text>
                    }
                </View>


            </View>
        </ScrollView>



    )
}

export default FileText