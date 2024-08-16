'use client';

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { IFormState } from '../../interfaces/IFormState';
import { useRouter } from 'next/navigation';
import { AvatarGenerator } from 'random-avatar-generator';
import Link from 'next/link';
import { auth, dbFirestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ChatName } from '@/components/ChatName';

const RegisterPage = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<IFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: '',
  });
  const router = useRouter();

  const generateRandomAvatar = () => {
    const generator = new AvatarGenerator();
    return generator.generateRandomAvatar();
  };

  const handleRefreshAvatar = () => {
    setFormState((prev) => ({
      ...prev,
      avatarUrl: generateRandomAvatar(),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formState.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formState.email,
        formState.password
      );
      const user = userCredential.user;
      const userRef = doc(dbFirestore, 'users', user.uid);
      await setDoc(userRef, {
        name: formState.name,
        email: formState.email,
        avatarUrl: formState.avatarUrl,
      });
      console.log('User created:', user);
      router.push('/');
      setErrors({});
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      avatarUrl: generateRandomAvatar(),
    }));
  }, []);

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-2xl shadow-lg p-10"
      >
        <ChatName />
        <div className="flex items-center space-y-2 justify-between border border-gray-200 p-2">
          <img
            src={formState.avatarUrl}
            alt="Avatar"
            className=" rounded-full h-20 w-20"
          />
          <button
            type="button"
            className="btn btn-outline hover:bg-custom-primary"
            onClick={handleRefreshAvatar}
          >
            New Avatar
          </button>
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Name</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full input input-bordered"
            value={formState.name}
            onChange={handleChange}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            className="w-full input input-bordered"
            value={formState.email}
            onChange={handleChange}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            className="w-full input input-bordered"
            value={formState.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full input input-bordered"
            value={formState.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="text-red-500">{errors.confirmPassword}</span>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-block bg-custom-primary hover:bg-custom-hover] text-white"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>

        <span>
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default RegisterPage;
