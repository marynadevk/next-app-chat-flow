'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ILoginFormState } from '@/interfaces/ILoginFormState';
import { ChatName } from '@/components/ChatName';

const LoginPage = () => {
  const [formState, setFormState] = useState<ILoginFormState>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formState.email.trim() || !emailRegex.test(formState.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      if (validateForm()) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formState.email,
          formState.password
        );
        const user = userCredential.user;
        if (user) {
          router.push('/');
        }

        setErrors({});
      }
    } catch (error) {
      console.error('Error logging in user:', error.message);
      setErrors({});
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      {/*form*/}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-2xl shadow-lg p-10"
      >
        <ChatName />

        {/*email*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered"
            name="email"
            value={formState.email}
            onChange={handleChange}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        {/*password*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full input input-bordered"
            name="password"
            value={formState.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-block bg-[#5e548e] hover:bg-[#e0b1cb] text-white"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <span>
          Do not have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Register
          </Link>
        </span>
      </form>
    </div>
  );
};

export default LoginPage;
