import { createIcon } from '@chakra-ui/icons';

export const FaceTrackingIcon = createIcon({
  displayName: 'FaceTracking-Icon',
  viewBox: '0 0 36 36',
  // path can also be an array of elements, if you have multiple paths, lines, shapes, etc.
  path: [
    <path
      key={0}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0H6C2.68629 0 0 2.68629 0 6V12H3V6C3 4.34315 4.34315 3 6 3H12V0ZM24 3V0H30C33.3137 0 36 2.68629 36 6V12H33V6C33 4.34315 31.6569 3 30 3H24ZM24 33H30C31.6569 33 33 31.6569 33 30V24H36V30C36 33.3137 33.3137 36 30 36H24V33ZM3 24V30C3 31.6569 4.34315 33 6 33H12V36H6C2.68629 36 0 33.3137 0 30V24H3Z"
      fill="currentColor"
    />,
    <path
      key={1}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 27.5C12.7919 27.5 10.2219 23.4708 9.57264 21.4611L12.4274 20.5389C12.855 21.8625 14.5927 24.5 18 24.5C21.4073 24.5 23.145 21.8625 23.5726 20.5389L26.4274 21.4611C25.7781 23.4708 23.2081 27.5 18 27.5Z"
      fill="currentColor"
    />,
    <path
      key={2}
      d="M14 13.5C14 14.8807 12.8807 16 11.5 16C10.1193 16 9 14.8807 9 13.5C9 12.1193 10.1193 11 11.5 11C12.8807 11 14 12.1193 14 13.5Z"
      fill="currentColor"
    />,
    <path
      key={3}
      d="M27 13.5C27 14.8807 25.8807 16 24.5 16C23.1193 16 22 14.8807 22 13.5C22 12.1193 23.1193 11 24.5 11C25.8807 11 27 12.1193 27 13.5Z"
      fill="currentColor"
    />,
  ],
});
