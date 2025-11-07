import ProjectArray from '../components/ProjectArray';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ProjectList = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.users);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <section>
            <h1 className="block lg:hidden text-3xl font-bold text-amber-100 my-4 p-2 text-center text-shadow-md text-shadow-black">Projects</h1>
            <ProjectArray />
        </section>
    )
}

export default ProjectList;