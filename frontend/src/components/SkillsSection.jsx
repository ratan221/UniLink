import { X, Pencil } from "lucide-react";
import { useState } from "react";

const SkillsSection = ({ userData, isOwnProfile, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [skills, setSkills] = useState(userData.skills || []);
	const [newSkill, setNewSkill] = useState("");
	const [originalSkills, setOriginalSkills] = useState([...skills]); // Store original skills for cancel

	const handleAddOrSave = () => {
		let updatedSkills = [...skills];

		// If a new skill is entered, add it
		if (newSkill && !skills.includes(newSkill)) {
			updatedSkills.push(newSkill);
			setNewSkill("");
		}

		// Save changes to backend
		setSkills(updatedSkills);
		onSave({ skills: updatedSkills });

		// Exit edit mode
		setIsEditing(false);
	};

	const handleDeleteSkill = (skill) => {
		const updatedSkills = skills.filter((s) => s !== skill);
		setSkills(updatedSkills);
		onSave({ skills: updatedSkills });
	};

	const handleCancel = () => {
		setSkills(originalSkills); // Restore original skills
		setIsEditing(false);
		setNewSkill("");
	};

	return (
		<div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-200">
			<h2 className="text-2xl font-semibold text-gray-900 mb-4 flex justify-between items-center">
				Skills
				{isOwnProfile && !isEditing && (
					<button onClick={() => { setIsEditing(true); setOriginalSkills([...skills]); }} className="text-gray-500 hover:text-blue-600 transition">
						<Pencil size={22} />
					</button>
				)}
			</h2>

			<div className="flex flex-wrap">
				{skills.map((skill, index) => (
					<span
						key={index}
						className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-2 flex items-center shadow-sm"
					>
						{skill}
						{isEditing && (
							<button onClick={() => handleDeleteSkill(skill)} className="ml-2 text-red-500 hover:text-red-700 transition">
								<X size={14} />
							</button>
						)}
					</span>
				))}
			</div>

			{isEditing && (
				<div className="mt-4">
					<div className="flex">
						<input
							type="text"
							placeholder="New Skill"
							value={newSkill}
							onChange={(e) => setNewSkill(e.target.value)}
							className="flex-grow p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
						/>
						
					</div>
					<div className="flex justify-end gap-3 mt-3">
					
						<button
							onClick={handleCancel}
							className="px-4 py-2 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
						>
							Cancel
						</button>
						<button
							onClick={handleAddOrSave}
							className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition"
						>
							{newSkill ? "Add Skill" : "Save Changes"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SkillsSection;
