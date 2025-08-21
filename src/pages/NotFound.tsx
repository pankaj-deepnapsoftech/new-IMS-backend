import NotFoundImage from '../assets/images/not-found.png';

const NotFound: React.FC = ()=>{
    return <div className='flex h-[100vh] justify-center items-center'>
        <img src={NotFoundImage} className='h-[30rem]' />
    </div>
}

export default NotFound;