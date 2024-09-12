'use client';

import React, { useEffect, useState } from 'react';
import { IFormState } from '../../interfaces/IFormState';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, dbFirestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ChatName } from '@/components/ChatName';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ERROR_MESSAGE } from '@/constants/constants';
import toast from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import NewAvatar from '@/components/NewAvatar';
import { injectStyle } from 'react-toastify/dist/inject-style';

enum RegisterFields {
  name = 'name',
  email = 'email',
  password = 'password',
  confirmPassword = 'confirmPassword',
}

const validationSchema = Yup.object()
  .shape({
    name: Yup.string().required(ERROR_MESSAGE.required),
    email: Yup.string()
      .email(ERROR_MESSAGE.email)
      .required(ERROR_MESSAGE.required),
    password: Yup.string()
      .min(6, ERROR_MESSAGE.minLength)
      .max(20, ERROR_MESSAGE.maxLength)
      .required(ERROR_MESSAGE.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], ERROR_MESSAGE.passwordConfirm)
      .required(ERROR_MESSAGE.required),
    avatarUrl: Yup.string().url(ERROR_MESSAGE.invalidUrl).required(),
  })
  .required();

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const methods = useForm<IFormState>({
    resolver: yupResolver<IFormState>(validationSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: IFormState) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const userRef = doc(dbFirestore, 'users', user.uid);
      await setDoc(userRef, {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
      });
      router.push('/');
    } catch (error) {
      toast.error(ERROR_MESSAGE.signUp);
    }
    setLoading(false);
  };

  useEffect(() => {
    injectStyle();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      <ToastContainer autoClose={500} />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-2xl shadow-lg p-10"
        >
          <ChatName />
          <NewAvatar setValue={setValue} />
          {Object.values(RegisterFields).map((field) => (
            <div key={field}>
              <label className="label">
                <span className="text-base label-text">{field}</span>
              </label>
              <input
                type={
                  field === RegisterFields.password ||
                  field === RegisterFields.confirmPassword
                    ? 'password'
                    : 'text'
                }
                placeholder={field}
                className="w-full input input-bordered"
                {...register(field)}
              />
              {errors[field] && (
                <p className="text-red-500 font-extralight text-xs">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}

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
      </FormProvider>
    </div>
  );
};

export default RegisterPage;
