import RulesDropdown from "./RulesDropdown";

export default function Navbar() {
    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        
                        <p className="text-white text-2xl font-bold">Word Mate</p>
                    </div>
                    <div className="flex items-center">
                        <RulesDropdown/>
                    </div>
                </div>
            </div>
        </nav>
    );
}