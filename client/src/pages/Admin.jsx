import ArticleForm from "../components/articleForm";
import DeleteList from "../components/DeleteList";


export default function Admin() {


    return (
        <>
            <section className='heading'>
                <h1 className='text-2xl md:text-5xl font-bold text-black border-black mt-5 mb-2 p-2 text-center text-shadow-md'>Welcome {admin && admin.name}</h1>
                <h1 className="text-lg md:text-xl md:m-5 font-bold text-shadow-md text-shadow-black text-indigo-400">Create a Article:</h1>
            </section>
            <ArticleForm />
            <DeleteList />
        </>
)
}