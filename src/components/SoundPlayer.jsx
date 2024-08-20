import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import tw from '../customTwrnc'
import * as COLORS from '../contants/COLORS'
import Icon from 'react-native-vector-icons/Ionicons';
import SoundPlayer from 'react-native-sound-player'
import { BACKEND_URL } from '../contants/URLS';
import Slider from '@react-native-community/slider';

const SoundPlayerComponent = ({ item,onClose }) => {
    const [isPlay, setIsPlay] = useState(false);
    const [soundInfo, setSoundInfo] = useState(null);
    const [seek,setSeek] = useState(0);
    const intervalRef = useRef(null);

    const playAudio = async (url) => {
        try {


            SoundPlayer.play();

            intervalRef.current = setInterval(async () => {
                const info = await SoundPlayer.getInfo();
                setSeek(info.currentTime);
            },1000);

        } catch (e) {
            console.log(`cannot play the sound file`, e)
        }
    }

    
    const pauseAudio = async () => {
        try {
            SoundPlayer.pause();
            clearInterval(intervalRef.current);     

        } catch (e) {
            console.log(`cannot play the sound file`, e)
        }
    }

    const handlePlay = async () => {
        if(isPlay){
            pauseAudio()
            setIsPlay(false);
        }else{
            playAudio()
            setIsPlay(true);
        }
    }

    const handleClose = () => {
        pauseAudio();
        clearInterval(intervalRef.current);
        onClose()
    }

    useEffect(() => {
        if(item){
            SoundPlayer.loadUrl(`${BACKEND_URL}${item?.public_url}`);
        }


        _onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying',({success }) => {
            setIsPlay(false);
            SoundPlayer.seek(0);
            pauseAudio();
            setSeek(0);
        })
        _onFinishedLoadingURLSubscription = SoundPlayer.addEventListener('FinishedLoadingURL', async ({ success, url }) => {
            const info = await SoundPlayer.getInfo()
            
            setSoundInfo(info);
            console.log(info)
        })

        return () => {
            _onFinishedPlayingSubscription?.remove();
            _onFinishedLoadingURLSubscription?.remove();
            clearInterval(intervalRef.current);
        }
    },[item]);
    return (
        <View style={tw`absolute top-0 left-0 right-0 bottom-0  z-20 flex items-center justify-center`}>

            <View style={tw.style(`bg-[${COLORS.BG_THIRD}] rounded-md flex px-4 py-4 shadow-md z-10 relative`,{width: Dimensions.get('window').width-30})}>
                <TouchableOpacity style={tw`absolute right-2 top-2 z-10`} onPress={handleClose}>
                    <Icon name={'close-outline'} color={COLORS.FOREGROUND_PRIMARY} size={30} />
                </TouchableOpacity>
                <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] text-white text-center text-lg mb-5`}>{item?.name.slice(0,20)}</Text>
                <View style={tw`flex items-center flex-row`}>
                    <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] opacity-80`}>{(seek/60).toFixed(2) || '0:00'}</Text>
                    <Slider style={tw`flex-1`} minimumValue={0} maximumValue={soundInfo?.duration} value={seek} onValueChange={(e) => SoundPlayer.seek(e)}/>
                    <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}] opacity-80`}>{soundInfo?.duration ? (soundInfo?.duration/60)?.toFixed(2) : '0:00'}</Text>
                </View>
                <View style={tw`flex items-center mt-3`}>
                    <TouchableOpacity onPress={handlePlay}>
                        <Icon name={isPlay ? 'pause' : 'play'} color={COLORS.FOREGROUND_PRIMARY} size={30} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default SoundPlayerComponent