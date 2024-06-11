type PathType = string
type PayloadType = Record<string, any>

const service = commoners.services.vame
export const baseUrl = new URL(service.url)

// This function ensures that errors are thrown when the response is not ok
export const request = async (
    pathname: PathType,
    payload?: PayloadType,
) => {

    const url = new URL(pathname, baseUrl)
    
    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    return new Promise((resolve, reject) => {

        fetch(url, payload ? { 
            method: 'POST', 
            body: JSON.stringify(payload),
            ...fetchOptions 
        } : fetchOptions)
        
        .then(async res => {
            const json  = await res.json()
            // console.warn(`Response (${pathname}):`, json)
            if (!res.ok) throw new Error(json.message)
            resolve(json)
        })

        .catch(reject)

    })
}

export const get = async (pathname: PathType) => request(pathname)

export const post = async (pathname: PathType, payload: PayloadType) => request(pathname, payload)