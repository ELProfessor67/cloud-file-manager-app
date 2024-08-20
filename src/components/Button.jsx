import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from '../customTwrnc'

const Button = ({bgcolor,children,onPress,textcolor,classes}) => {
  return (
    <TouchableOpacity onPress={onPress}>
        <View style={tw`py-1 px-4 bg-[${bgcolor}] flex items-center rounded-md my-2 ${classes}`}>
            <Text style={tw`text-[${textcolor}] text-lg`}>{children}</Text>
        </View>
    </TouchableOpacity>
  )
}

export default Button