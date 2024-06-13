type PathType = string
type PayloadType = Record<string, any>

const service = commoners.services.vame
export const baseUrl = new URL(service.url)

type HeadersType = Record<string, string>

// This function ensures that errors are thrown when the response is not ok
export const request = async (
    pathname: PathType,
    payload?: PayloadType,
    headers: HeadersType= {}
) => {

    const url = new URL(pathname, baseUrl)
    
    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // Add custom headers
    for (const key in headers) fetchOptions.headers[key] = headers[key]

    return new Promise((resolve, reject) => {

        console.warn(`Request (${pathname}):`, payload)

        fetch(url, payload ? { 
            method: 'POST', 
            body: JSON.stringify(payload),
            ...fetchOptions 
        } : fetchOptions)
        
        .then(async res => {

            // Check type of response to determine how to parse it
            const contentType = res.headers.get('content-type')

            let resolved;
            if (!contentType) throw new Error('Response has no content-type')
            if (contentType.includes('application/json')) resolved = await res.json()
            else if (contentType.includes('text/plain')) resolved = await res.text()
            else throw new Error(`Unsupported content-type: ${contentType}`)
                

            console.warn(`Response (${pathname}):`, resolved)
            if (!res.ok) throw new Error(resolved?.message ?? resolved)
            resolve(resolved)
        })

        .catch(reject)

    })
}

export const get = async (
    pathname: PathType,
    headers?: HeadersType
) => request(pathname, undefined, headers)

export const post = async (
    pathname: PathType, 
    payload: PayloadType, 
    headers?: HeadersType
) => request(pathname, payload, headers)