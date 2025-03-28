import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UserProtectWrapper = ({ children }) => {
    const navigate = useNavigate()
    
    useEffect(() => {
        const token = localStorage.getItem('userToken')
        if (!token) {
            navigate('/userLogin')
        }
    }, [navigate])

    return <>{children}</>
}

export default UserProtectWrapper
