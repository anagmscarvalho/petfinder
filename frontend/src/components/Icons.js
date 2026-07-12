import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export const SearchIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="28 64 24 24" style={style} fill="none">
    <Path d="M38 82C42.4183 82 46 78.4183 46 74C46 69.5817 42.4183 66 38 66C33.5817 66 30 69.5817 30 74C30 78.4183 33.5817 82 38 82Z" stroke={color} strokeWidth="2" />
    <Path d="M44 80L49 85" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SearchTabIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="27 728 24 24" style={style} fill="none">
    <Path d="M37 746C41.4183 746 45 742.418 45 738C45 733.582 41.4183 730 37 730C32.5817 730 29 733.582 29 738C29 742.418 32.5817 746 37 746Z" stroke={color} strokeWidth="2" />
    <Path d="M43 744L48 749" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BellIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="250 724 24 27" style={style} fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M263.5 726.281C264.07 726.281 264.531 726.743 264.531 727.312V729.095C268.601 729.603 271.75 733.074 271.75 737.281V741.64C271.75 741.763 271.816 741.877 271.923 741.938L273.029 742.57C273.697 742.952 274.142 743.629 274.227 744.394L274.324 745.266C274.482 746.691 273.367 747.938 271.933 747.938H266.594C266.594 749.646 265.209 751.031 263.5 751.031C261.791 751.031 260.406 749.646 260.406 747.938H255.067C253.633 747.938 252.518 746.691 252.676 745.266L252.773 744.394C252.858 743.629 253.303 742.952 253.971 742.57L255.077 741.938C255.184 741.877 255.25 741.763 255.25 741.64V737.281C255.25 733.074 258.399 729.603 262.469 729.095V727.312C262.469 726.743 262.93 726.281 263.5 726.281ZM262.469 747.938C262.469 748.507 262.93 748.969 263.5 748.969C264.07 748.969 264.531 748.507 264.531 747.938H262.469ZM263.5 731.094C260.083 731.094 257.312 733.864 257.312 737.281V741.64C257.312 742.503 256.85 743.3 256.1 743.729L254.994 744.361C254.898 744.415 254.835 744.512 254.823 744.621L254.726 745.493C254.703 745.697 254.863 745.875 255.067 745.875H271.933C272.137 745.875 272.297 745.697 272.274 745.493L272.177 744.621C272.165 744.512 272.102 744.415 272.006 744.361L270.9 743.729C270.15 743.3 269.687 742.503 269.687 741.64V737.281C269.687 733.864 266.917 731.094 263.5 731.094Z" fill={color} />
  </Svg>
);

export const PlusIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="176 722 24 24" style={style} fill="none">
    <Path d="M188 724V744" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <Path d="M178 734H198" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

export const ProfileIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="324 724 22 26" style={style} fill="none">
    <Path d="M335 738C338.314 738 341 735.314 341 732C341 728.686 338.314 726 335 726C331.686 726 329 728.686 329 732C329 735.314 331.686 738 335 738Z" stroke={color} strokeWidth="1.8" />
    <Path d="M326 748C326 742 329.75 738 335 738C340.25 738 344 742 344 748" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const HeartIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="334 370 16 14" style={style} fill="none">
    <Path d="M342 382C341 381 336 378 336 375C336 373 337.5 371.5 339 371.5C340 371.5 341 372 342 373C343 372 344 371.5 345 371.5C346.5 371.5 348 373 348 375C348 378 343 381 342 382Z" stroke={color} strokeWidth="1.5" />
  </Svg>
);

export const ArrowLeftIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="12 8 12 20" style={style} fill="none">
    <Path d="M22 10l-8 8 8 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CameraIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="171 111 32 32" style={style} fill="none">
    <Path d="M197 118H177C174.791 118 173 119.791 173 122V136C173 138.209 174.791 140 177 140H197C199.209 140 201 138.209 201 136V122C201 119.791 199.209 118 197 118Z" stroke={color} strokeWidth="2" />
    <Path d="M187 136C190.314 136 193 133.314 193 130C193 126.686 190.314 124 187 124C183.686 124 181 126.686 181 130C181 133.314 183.686 136 187 136Z" stroke={color} strokeWidth="2" />
    <Path d="M181 118L184 113H190L193 118" stroke={color} strokeWidth="2" />
  </Svg>
);

export const ChatListIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="260 115 24 24" style={style} fill="none">
    <Path d="M272 127C274.761 127 277 124.761 277 122C277 119.239 274.761 117 272 117C269.239 117 267 119.239 267 122C267 124.761 269.239 127 272 127Z" stroke={color} strokeWidth="1.5" />
    <Path d="M265 134C265 130 268 127 272 127C276 127 279 130 279 134" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const PawIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="92 724 28 28" style={style} fill="none">
    <Path d="M105.242 731C106.623 731 107.742 729.881 107.742 728.5C107.742 727.119 106.623 726 105.242 726C103.862 726 102.742 727.119 102.742 728.5C102.742 729.881 103.862 731 105.242 731Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M113.992 736C115.373 736 116.492 734.881 116.492 733.5C116.492 732.119 115.373 731 113.992 731C112.612 731 111.492 732.119 111.492 733.5C111.492 734.881 112.612 736 113.992 736Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M116.492 746C117.873 746 118.992 744.881 118.992 743.5C118.992 742.119 117.873 741 116.492 741C115.112 741 113.992 742.119 113.992 743.5C113.992 744.881 115.112 746 116.492 746Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M102.742 736C103.563 736 104.376 736.162 105.134 736.476C105.892 736.79 106.581 737.25 107.162 737.831C107.742 738.411 108.203 739.1 108.517 739.858C108.831 740.617 108.992 741.429 108.992 742.25V746.625C108.992 747.671 108.617 748.681 107.936 749.475C107.255 750.268 106.312 750.79 105.278 750.948C104.245 751.106 103.189 750.889 102.301 750.335C101.414 749.782 100.755 748.929 100.442 747.931C99.909 746.21 98.784 745.083 97.0674 744.55C96.0701 744.238 95.2176 743.579 94.6641 742.692C94.1106 741.806 93.8926 740.751 94.0497 739.717C94.2068 738.684 94.7285 737.741 95.5205 737.06C96.3125 736.378 97.3223 736.002 98.3674 736H102.742Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DoorOutIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const SettingsIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const InfoIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const EditIcon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

