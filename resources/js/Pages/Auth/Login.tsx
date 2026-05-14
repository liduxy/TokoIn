import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Container Utama dengan gradasi yang serasi */}
            <div className="flex flex-col items-center justify-center py-4">
                <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-indigo-800 to-purple-700 shadow-2xl">
                    
                    {/* Judul */}
                    <h2 className="text-3xl font-bold text-center text-white mb-8">
                        Login
                    </h2>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-300 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-white" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl bg-gray-200 border-0 focus:ring-2 focus:ring-green-400 text-gray-900"
                                placeholder="username@gmail.com"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2 text-red-300" />
                        </div>

                        {/* Password */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" className="text-white" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl bg-gray-200 border-0 focus:ring-2 focus:ring-green-400 text-gray-900"
                                placeholder="Password"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2 text-red-300" />
                        </div>

                        {/* Link Lupa Password & Remember Me */}
                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-200">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-200 underline hover:text-white transition duration-150"
                                >
                                    Forgot Password?
                                </Link>
                            )}
                        </div>

                        {/* Tombol Login */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-green-400 hover:bg-green-500 text-white font-bold text-lg shadow-lg transform transition active:scale-95 disabled:opacity-50"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}