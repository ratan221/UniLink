import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import { fireApi } from "../../utils/useFire";
import { useNavigate } from "react-router-dom"; // Changed from Navigate to useNavigate

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const validateSRMAPEmail = (email) => {
    return email.toLowerCase().endsWith('@srmap.edu.in');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate email domain
    if (!validateSRMAPEmail(data.email)) {
      toast.error('Please use your SRMAP email address (@srmap.edu.in)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fireApi("/register", "POST", data);
      toast.success(response.message);
      e.target.reset();
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <input
        type="text"
        name="name"
        placeholder="Full name"
        className="input input-bordered w-full"
        required
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        className="input input-bordered w-full"
        required
      />
      <input
        type="email"
        placeholder="SRMAP Email"
        name="email"
        pattern="[a-zA-Z0-9._%+-]+@srmap\.edu\.in$"
        title="Please use your SRMAP email address (@srmap.edu.in)"
        className="input input-bordered w-full"
        required
      />
      <input
        type="password"
        placeholder="Password (6+ characters)"
        name="password"
        className="input input-bordered w-full"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full text-white"
      >
        {isLoading ? (
          <Loader className="size-5 animate-spin" />
        ) : (
          "Agree & Join"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;