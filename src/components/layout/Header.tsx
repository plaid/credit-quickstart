import PlatypusLogo from "../PlatypusLogo";

const Header: React.FC = () => {
  return (
    <header className="bg-mint-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <PlatypusLogo size={56} />
        <div>
          <h1 className="text-2xl font-bold">Platypus Lending</h1>
          <p className="text-sm text-white/60">
            Loans for people as unique as us.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
