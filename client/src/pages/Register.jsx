import UserRegister from "../components/UserRegister";

export default function RegisterPage() {
  return (
    <div
      className="
        min-h-screen
        text-gray-900
        flex
        items-start
        md:items-center
        justify-center
        px-4
        pt-10
        md:pt-0
      "
    >
      <UserRegister />
    </div>
  );
}
