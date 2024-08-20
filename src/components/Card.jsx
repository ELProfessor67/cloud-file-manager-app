import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import tw from '../customTwrnc'
import * as COLORS from '../contants/COLORS'
import Icon from 'react-native-vector-icons/Ionicons'

const Card = ({iconname,title,onPress,width='10rem',lenght=0,showitems=true}) => {
  return (
    <TouchableOpacity onPress={onPress}>
        <View style={tw.style(`px-4 py-4 rounded-lg bg-black/50 flex flex-row items-center m-2]`,{width: (Dimensions.get('window').width/2)-40})}>
            <Icon name={iconname} size={30} color={COLORS.FOREGROUND_PRIMARY}/>
            <View style={tw`ml-3`}>

              <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}]  text-lg`}>{title}</Text>
              {showitems && <Text style={tw`text-[${COLORS.FOREGROUND_PRIMARY}]  mt-0 opacity-50`}>{lenght} items</Text>}
              
            </View>
        </View>
    </TouchableOpacity>
  )
}

export default Card