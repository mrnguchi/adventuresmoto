import Image from "next/image";

type SocialSignInProps = {
  onSelect: (provider: string) => void;
};

const socialProviders = [
  { name: "Google", image: "/images/google.png" },
  { name: "Facebook", image: "/images/facebook.png" },
  { name: "Microsoft", image: "/images/microsoft.png" },
];

export function SocialSignIn({ onSelect }: SocialSignInProps) {
  return (
    <div className="social-sign-in">
      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="social-sign-in-grid">
        {socialProviders.map((provider) => (
          <button
            type="button"
            key={provider.name}
            onClick={() => onSelect(provider.name)}
          >
            <Image
              src={provider.image}
              alt=""
              width={28}
              height={28}
            />
            <span>Continue with {provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
