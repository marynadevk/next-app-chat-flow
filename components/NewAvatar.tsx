'use client';

import { IFormState } from '@/interfaces/index';
import { AvatarGenerator } from 'random-avatar-generator';
import React, { FC, useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

type Props = {
  setValue: UseFormSetValue<IFormState>;
};

const NewAvatar: FC<Props> = ({ setValue }) => {
  const generateRandomAvatar = () => {
    const generator = new AvatarGenerator();
    return generator.generateRandomAvatar();
  };
  const [avatarUrl, setAvatarUrl] = useState<string>(generateRandomAvatar());

  useEffect(() => {
    setValue('avatarUrl', avatarUrl);
  }, []);

  const handleRefreshAvatar = () => {
    const newAvatar = generateRandomAvatar();
    setAvatarUrl(newAvatar);
    setValue('avatarUrl', newAvatar);
  };

  return (
    <div className="flex items-center space-y-2 justify-between border border-gray-200 p-2">
      <img src={avatarUrl} alt="Avatar" className=" rounded-full h-20 w-20" />
      <button
        type="button"
        className="btn btn-outline btn-accent"
        onClick={handleRefreshAvatar}
      >
        New Avatar
      </button>
    </div>
  );
};

export default NewAvatar;
