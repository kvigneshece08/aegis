import React, {useState, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const RNTooltip = ({text, children}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const tooltipRef = useRef(null);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Close after 5 seconds
    }
  };

  const calculateTooltipPosition = () => {
    if (tooltipRef.current) {
      tooltipRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTooltipWidth(width);
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 5000); // Close after 5 seconds
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleTooltip}
        activeOpacity={0.8}
        ref={tooltipRef}>
        {children}
      </TouchableOpacity>
      {isVisible && (
        <View
          style={[styles.tooltipContainer, {width: tooltipWidth}]}
          onLayout={calculateTooltipPosition}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 999,
  },
  tooltipText: {
    color: '#fff',
  },
});

export default RNTooltip;
