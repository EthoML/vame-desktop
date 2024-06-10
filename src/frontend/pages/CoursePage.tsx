import Courses from '../components/Courses'
import CourseList from '../components/Courselist'
import TestSchedule from '../components/TestSchedule'

import styled from 'styled-components';

const courseDetails = [
    { id: 1, total: 2, text: 'Current Courses ', color: 'orange' },
    { id: 2, total: 5, text: 'Completed Courses', color: 'green', },
    { id: 3, total: 10, text: "Interested Courses", color: 'blue' },
];

const CourseWrapper = styled.div`
    background-color: lightblue;
`;

const Body = () => {
    return (
        <CourseWrapper className='w-100'>
            <div className='d-flex justify-content-around'>
                <div>
                    <div className='d-flex gap-5 mt-4 '>
                        {courseDetails.map(each => (
                            <Courses key={each.id} each={each} />
                        ))}
                    </div>
                    <div>
                        <CourseList />
                    </div>
                </div>
                <TestSchedule />
            </div>
        </CourseWrapper>
    );
};

export default Body;